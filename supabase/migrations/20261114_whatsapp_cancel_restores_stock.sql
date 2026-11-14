-- 1) A WhatsApp cancellation now gives the stock back, like the admin cancel.
--    create_modox_v2_order_with_delivery removes stock when the order is created,
--    but confirm_whatsapp_order_v2 did not add it back on "إلغاء الطلب".
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
  WHERE c.message_id = p_message_id
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

  -- Cancellation must never trigger Ozon fulfillment
  IF p_action = 'cancelled' THEN
    RETURN NULL;
  END IF;

  RETURN v_order_id;
END;
$function$;

-- 2) Close the old direct-insert path. The site now creates orders only
--    through /api/orders (service role + create_modox_v2_order_idempotent).
--    This policy let anyone with the public anon key insert any order and total.
DROP POLICY IF EXISTS "Allow public order creation" ON public.orders;
