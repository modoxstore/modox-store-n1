"use server";
import { uploadProductImage } from "./uploadProductImage";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function readProduct(form: FormData) {
  const name = String(form.get("name") ?? "").trim();
  const price = Number(form.get("price"));
  const stock = Number(form.get("stock"));
  const image = String(form.get("image") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const ozon_ref = String(form.get("ozon_ref") ?? "").trim();

  if (
    name.length < 2 ||
    name.length > 200 ||
    !Number.isSafeInteger(price) ||
    price < 0 ||
    !Number.isSafeInteger(stock) ||
    stock < 0 ||
    description.length > 2000 ||
    ozon_ref.length > 100 ||
    (image !== "" &&
      !image.startsWith("/images/") &&
      !/^https:\/\//i.test(image))
  ) {
    throw new Error("Invalid product information");
  }

  return {
    name,
    price,
    stock,
    image: image || null,
    description: description || null,
    ozon_ref: ozon_ref || null,
  };
}

export async function createAdminProduct(form: FormData) {
  await requireAdmin();

  const imageFile = form.get("imageFile");

  if (!(imageFile instanceof File) || imageFile.size === 0) {
    throw new Error("Please select a product image");
  }

  const product = readProduct(form);

  const { data, error } = await supabaseAdmin
    .from("products")
    .insert({
      ...product,
      active: false,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error("Could not create product");
  }

  try {
    const uploadForm = new FormData();
    uploadForm.set("id", data.id);
    uploadForm.set("imageFile", imageFile);

    await uploadProductImage(uploadForm);
  } catch (error) {
    const { error: rollbackError } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", data.id);

    if (rollbackError) {
      console.error("Product rollback failed:", rollbackError.message);
    }

    throw error;
  }

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/shop");
}
export async function updateAdminProduct(form: FormData) {
  await requireAdmin();

  const id = String(form.get("id") ?? "");

  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    throw new Error("Invalid product ID");
  }

  const product = readProduct(form);

  const { error } = await supabaseAdmin
    .from("products")
    .update(product)
    .eq("id", id);

  if (error) throw new Error("Could not update product");

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/shop");
}

export async function toggleAdminProduct(form: FormData) {
  await requireAdmin();

  const id = String(form.get("id") ?? "");
  const active = String(form.get("active")) === "true";

  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    throw new Error("Invalid product ID");
  }

  const { error } = await supabaseAdmin
    .from("products")
    .update({ active: !active })
    .eq("id", id);

  if (error) throw new Error("Could not change visibility");

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/shop");
}
