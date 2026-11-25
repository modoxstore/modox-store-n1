-- Black Friday 2026: new prices until 30 Nov 23:59 (Morocco time).
-- The crossed-out price (old_price) is today's price. After the end the
-- job below puts every Black Friday price back automatically.
-- Only products with no promotion running are touched.

with bf(name, new_price) as (
  values
    -- Prices worked out from the purchase cost (+10 DH Ozon packaging)
    ('S6 Phone Cooler', 129),               -- 199, -35%
    ('Power Bank 9000mAh', 149),            -- 199
    ('Perche Selfie Bluetooth avec Ring Light Intégré et Trépied', 129), -- 165
    ('JC-22S Selfie Stick', 119),           -- 149
    -- -20% on everything else
    ('S38 Phone Cooler', 119),              -- 149
    ('Casque Wireless', 135),               -- 169
    ('RGB Phone Cooler', 96),               -- 120
    ('Bluetooth Keyboard AR', 104),         -- 130
    ('XS-06 Phone Cooler', 79),             -- 99
    ('USB-C HUB FD-U2', 48),                -- 60
    ('Fast Charger 4 in 1', 72),            -- 90
    ('WOVA 240W Cable', 64),                -- 80
    ('Écouteurs TWS Pro', 88),              -- 110
    ('Cartoon Spray Fan', 52),              -- 65
    ('Electric Mosquito Swatter', 72),      -- 90
    ('Capybara Fan', 44),                   -- 55
    ('Baseus 65W Cable', 40),               -- 50
    ('Gaming Finger Sleeves', 16),          -- 20
    ('S51 Phone Cooler', 119),              -- 149 (out of stock)
    ('Smart Watch + Écouteurs Pack', 144),  -- 180 (out of stock)
    ('XS-09 Phone Cooler', 79),             -- 99 (out of stock)
    ('Écouteurs Bluetooth TWS', 48)         -- 60 (out of stock)
)
update public.products p
set old_price = p.price,
    price = bf.new_price,
    promo_end = '2026-11-30 23:59:59+01'
from bf
where p.name = bf.name
  and p.active = true
  and bf.new_price < p.price
  and (p.promo_end is null or p.promo_end < now())
returning p.name, p.old_price as before, p.price as black_friday;

-- Puts Black Friday prices back once the promotion is over.
create or replace function public.end_black_friday_2026()
returns integer
language plpgsql security definer set search_path to ''
as $$
declare
  v_count integer;
begin
  update public.products
  set price = old_price, old_price = null, promo_end = null
  where promo_end = '2026-11-30 23:59:59+01'
    and old_price is not null
    and now() >= promo_end;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.end_black_friday_2026() from public, anon, authenticated;

select cron.schedule(
  'end-black-friday-2026',
  '*/10 * * * *',
  $$select public.end_black_friday_2026()$$
);
