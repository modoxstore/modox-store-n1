-- 12h WhatsApp reminder: one re-send of the confirmation template when the
-- customer has not answered. The reply may answer either message.
alter table public.whatsapp_order_confirmations
  add column if not exists reminder_sent_at timestamptz,
  add column if not exists reminder_message_id text unique;

CREATE OR REPLACE FUNCTION public.confirm_whatsapp_order_v2(p_message_id text, p_phone text, p_action text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_order_id uuid;
  v_status text;
  v_item record;
BEGIN
  IF p_message_id IS NULL
     OR p_message_id NOT LIKE 'wamid.%'
     OR p_phone !~ '^212[567][0-9]{8}$'
     OR p_action NOT IN ('confirmed', 'cancelled')
  THEN
    RETURN NULL;
  END IF;

  SELECT c.order_id
  INTO v_order_id
  FROM public.whatsapp_order_confirmations c
  WHERE (c.message_id = p_message_id OR c.reminder_message_id = p_message_id)
    AND c.phone = p_phone
    AND c.status = 'sent'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  UPDATE public.orders
  SET status = p_action
  WHERE id = v_order_id
    AND status = 'new'
    AND source = 'modox_v2'
  RETURNING status INTO v_status;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  IF p_action = 'cancelled' THEN
    FOR v_item IN
      SELECT product_id, sum(quantity)::integer AS qty
      FROM public.order_items
      WHERE order_id = v_order_id
        AND product_id IS NOT NULL
      GROUP BY product_id
    LOOP
      UPDATE public.products
      SET stock = coalesce(stock, 0) + v_item.qty
      WHERE id = v_item.product_id;
    END LOOP;
  END IF;

  UPDATE public.whatsapp_order_confirmations
  SET status = p_action,
      responded_at = now()
  WHERE order_id = v_order_id;

  IF p_action = 'cancelled' THEN
    RETURN NULL;
  END IF;

  RETURN v_order_id;
END;
$function$;

-- Hourly call to https://modox.ma/api/cron/whatsapp-reminders is scheduled
-- with pg_cron + pg_net (the Bearer secret lives in the cron job, not here).
