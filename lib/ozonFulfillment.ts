import "server-only";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type OzonProduct = {
  ref: string;
  qnty: number;
};

export async function prepareOzonStockOrder(orderId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) {
    throw new Error("Invalid order ID");
  }

  const { data: order, error: orderError } =
    await supabaseAdmin
      .from("orders")
      .select(
        "id,customer_name,phone,city,address,total,status,source,ozon_city_id,delivery_fee"
      )
      .eq("id", orderId)
      .eq("source", "modox_v2")
      .single();

  if (orderError || !order) {
    throw new Error("Order not found");
  }

  if (/TEST/i.test(order.customer_name ?? "") || /DO NOT SHIP/i.test(order.address ?? "")) {
    throw new Error("Test order cannot be fulfilled");
  }

  if (order.status !== "confirmed") {
    throw new Error("Order not confirmed");
  }

  const { data: existing, error: fulfillmentError } =
    await supabaseAdmin
      .from("ozon_fulfillments")
      .select("status,tracking_number")
      .eq("order_id", orderId)
      .maybeSingle();

  if (fulfillmentError) {
    throw new Error("Fulfillment lookup failed");
  }

  if (existing) {
    throw new Error(
      "Fulfillment already exists; manual verification required"
    );
  }

  const { data: items, error: itemsError } =
    await supabaseAdmin
      .from("order_items")
      .select(
        "product_id,quantity,products(name,ozon_ref)"
      )
      .eq("order_id", orderId);

  if (itemsError || !items?.length) {
    throw new Error("Order items missing");
  }

  const products: OzonProduct[] = [];

  for (const item of items) {
    const productData = item.products;
    const product = (
      Array.isArray(productData)
        ? productData[0]
        : productData
    ) as { name?: string; ozon_ref?: string | null } | null;

    if (
      !product?.ozon_ref ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1
    ) {
      throw new Error("Missing Ozon reference or invalid quantity");
    }

    products.push({
      ref: product.ozon_ref,
      qnty: item.quantity,
    });
  }

  if (
    !Number.isInteger(order.ozon_city_id) ||
    !Number.isInteger(order.total) ||
    !Number.isInteger(order.delivery_fee)
  ) {
    throw new Error("Invalid Ozon delivery data");
  }

  const formFields = {
    "parcel-receiver": order.customer_name,
    "parcel-phone": order.phone,
    "parcel-city": String(order.ozon_city_id),
    "parcel-address": order.address,
    "parcel-price": String(order.total - order.delivery_fee),
    "parcel-stock": "1",
    "products": JSON.stringify(products),
  };

  return {
    orderId: order.id,
    mode: "DRY_RUN" as const,
    formFields,
    // Ozon collects product price; delivery is handled separately.
    productAmount: order.total - order.delivery_fee,
    customerTotal: order.total,
    deliveryFee: order.delivery_fee,
  };
}
