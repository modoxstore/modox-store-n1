-- Customer accounts (phone + WhatsApp code), XP from delivered orders,
-- and the Legendary reward (one free product under 300 DH, delivery paid).
-- Every table is server-only: RLS on, no grants to anon/authenticated.

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique check (phone ~ '^212[567][0-9]{8}$'),
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table if not exists public.customer_login_codes (
  id uuid primary key default gen_random_uuid(),
  phone text not null check (phone ~ '^212[567][0-9]{8}$'),
  code_hash text not null,
  attempts integer not null default 0,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists customer_login_codes_phone_idx
  on public.customer_login_codes (phone, created_at desc);

create table if not exists public.customer_sessions (
  token_hash text primary key,
  customer_id uuid not null references public.customers(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists customer_sessions_customer_idx
  on public.customer_sessions (customer_id);

-- Orders the admin marked as delivered (paid at the door).
create table if not exists public.order_deliveries (
  order_id uuid primary key references public.orders(id) on delete cascade,
  delivered_at timestamptz not null default now()
);

-- XP ledger, keyed by phone so orders placed before the account count too.
-- +XP: one row per delivered order. -XP: one row per reward.
create table if not exists public.xp_events (
  id uuid primary key default gen_random_uuid(),
  phone text not null check (phone ~ '^212[567][0-9]{8}$'),
  order_id uuid references public.orders(id) on delete set null,
  amount integer not null,
  reason text not null check (reason in ('order_delivered', 'legendary_reward')),
  created_at timestamptz not null default now(),
  unique (order_id, reason)
);
create index if not exists xp_events_phone_idx on public.xp_events (phone);

create table if not exists public.reward_claims (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  order_id uuid not null unique references public.orders(id) on delete cascade,
  xp_spent integer not null,
  created_at timestamptz not null default now()
);

alter table public.customers enable row level security;
alter table public.customer_login_codes enable row level security;
alter table public.customer_sessions enable row level security;
alter table public.order_deliveries enable row level security;
alter table public.xp_events enable row level security;
alter table public.reward_claims enable row level security;

revoke all on public.customers, public.customer_login_codes,
  public.customer_sessions, public.order_deliveries, public.xp_events,
  public.reward_claims from anon, authenticated;

-- Checks a login code: at most 5 tries per code, 10 minute life, one use.
-- Returns the customer id on success, NULL otherwise.
create or replace function public.verify_customer_login_code(
  p_phone text, p_code_hash text
) returns uuid
language plpgsql security definer set search_path to ''
as $$
declare
  v_code record;
  v_customer_id uuid;
begin
  if p_phone !~ '^212[567][0-9]{8}$' or p_code_hash !~ '^[0-9a-f]{64}$' then
    return null;
  end if;

  select id, code_hash, attempts into v_code
  from public.customer_login_codes
  where phone = p_phone and used_at is null and expires_at > now()
  order by created_at desc
  limit 1
  for update;

  if not found or v_code.attempts >= 5 then
    return null;
  end if;

  update public.customer_login_codes
  set attempts = attempts + 1
  where id = v_code.id;

  if v_code.code_hash <> p_code_hash then
    return null;
  end if;

  update public.customer_login_codes set used_at = now() where id = v_code.id;

  insert into public.customers (phone, last_login_at)
  values (p_phone, now())
  on conflict (phone) do update set last_login_at = now()
  returning id into v_customer_id;

  return v_customer_id;
end;
$$;

-- Admin: a confirmed order was delivered and paid. Gives 1 XP per DH of
-- products (delivery fee excluded). Running it twice gives XP once.
create or replace function public.admin_mark_order_delivered(p_order_id uuid)
returns integer
language plpgsql security definer set search_path to ''
as $$
declare
  v_order record;
  v_xp integer;
begin
  select id, phone, total, coalesce(delivery_fee, 0) as delivery_fee, status
  into v_order
  from public.orders
  where id = p_order_id and source = 'modox_v2'
  for update;

  if not found or v_order.status <> 'confirmed' then
    raise exception 'Only confirmed orders can be marked delivered';
  end if;

  insert into public.order_deliveries (order_id) values (p_order_id)
  on conflict (order_id) do nothing;

  if not found then
    return 0;
  end if;

  v_xp := greatest(floor(v_order.total - v_order.delivery_fee)::integer, 0);

  if v_xp > 0 and v_order.phone ~ '^212[567][0-9]{8}$' then
    insert into public.xp_events (phone, order_id, amount, reason)
    values (v_order.phone, p_order_id, v_xp, 'order_delivered')
    on conflict (order_id, reason) do nothing;
  end if;

  return v_xp;
end;
$$;

-- XP balance. A reward whose order was cancelled does not count,
-- so the customer gets the XP back.
create or replace function public.customer_xp_balance(p_phone text)
returns integer
language sql stable security definer set search_path to ''
as $$
  select coalesce(sum(e.amount), 0)::integer
  from public.xp_events e
  left join public.orders o on o.id = e.order_id
  where e.phone = p_phone
    and not (e.reason = 'legendary_reward' and coalesce(o.status, '') = 'cancelled');
$$;

-- Turns a just-created order (one product under the price limit) into the
-- Legendary reward: product free, customer pays delivery only, XP spent.
-- Locked per phone so two claims at once cannot both pass.
create or replace function public.finalize_legendary_reward(
  p_order_id uuid, p_phone text, p_xp_cost integer, p_max_price numeric
) returns boolean
language plpgsql security definer set search_path to ''
as $$
declare
  v_balance integer;
  v_order record;
  v_items integer;
  v_qty integer;
  v_price numeric;
begin
  perform pg_advisory_xact_lock(hashtext('xp:' || p_phone));

  v_balance := public.customer_xp_balance(p_phone);

  if v_balance < p_xp_cost then
    return false;
  end if;

  select id, phone, status, coalesce(delivery_fee, 0) as delivery_fee
  into v_order
  from public.orders
  where id = p_order_id and source = 'modox_v2'
  for update;

  if not found or v_order.phone <> p_phone or v_order.status <> 'new' then
    return false;
  end if;

  select count(*), coalesce(sum(quantity), 0), coalesce(max(price), 0)
  into v_items, v_qty, v_price
  from public.order_items where order_id = p_order_id;

  if v_items <> 1 or v_qty <> 1 or v_price >= p_max_price then
    return false;
  end if;

  update public.order_items set price = 0 where order_id = p_order_id;
  update public.orders set total = v_order.delivery_fee where id = p_order_id;

  insert into public.xp_events (phone, order_id, amount, reason)
  values (p_phone, p_order_id, -p_xp_cost, 'legendary_reward');

  insert into public.reward_claims (phone, order_id, xp_spent)
  values (p_phone, p_order_id, p_xp_cost);

  return true;
end;
$$;

revoke all on function public.verify_customer_login_code(text, text),
  public.admin_mark_order_delivered(uuid),
  public.finalize_legendary_reward(uuid, text, integer, numeric),
  public.customer_xp_balance(text)
  from public, anon, authenticated;
grant execute on function public.verify_customer_login_code(text, text),
  public.admin_mark_order_delivered(uuid),
  public.finalize_legendary_reward(uuid, text, integer, numeric),
  public.customer_xp_balance(text)
  to service_role;
