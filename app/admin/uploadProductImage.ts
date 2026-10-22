"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function uploadProductImage(form: FormData) {
  await requireAdmin();

  const id = String(form.get("id") ?? "");
  const file = form.get("imageFile");

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw new Error("Invalid product ID");
  }

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Please select an image");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Maximum image size is 5MB");
  }

  const formats: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };

  const extension = formats[file.type];

  if (!extension) {
    throw new Error("Only JPG, PNG and WEBP images are accepted");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  const jpeg =
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff;

  const png =
    bytes.length >= 8 &&
    [137,80,78,71,13,10,26,10].every(
      (value, index) => bytes[index] === value
    );

  const webp =
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0,4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8,12)) === "WEBP";

  const valid =
    (file.type === "image/jpeg" && jpeg) ||
    (file.type === "image/png" && png) ||
    (file.type === "image/webp" && webp);

  if (!valid) {
    throw new Error("Invalid image content");
  }

  const { data: product, error: findError } = await supabaseAdmin
    .from("products")
    .select("id")
    .eq("id", id)
    .single();

  if (findError || !product) {
    throw new Error("Product not found");
  }

  const path = `${id}/${crypto.randomUUID()}.${extension}`;
  const bucket = supabaseAdmin.storage.from("product-images");

  const { error: uploadError } = await bucket.upload(path, bytes, {
    contentType: file.type,
    upsert: false,
    cacheControl: "3600",
  });

  if (uploadError) {
    console.error("Image upload failed:", uploadError.message);
    throw new Error("Image upload failed");
  }

  const { data } = bucket.getPublicUrl(path);

  const { error: updateError } = await supabaseAdmin
    .from("products")
    .update({ image: data.publicUrl })
    .eq("id", id);

  if (updateError) {
    await bucket.remove([path]);
    console.error("Image update failed:", updateError.message);
    throw new Error("Could not save product image");
  }

  revalidatePath("/admin");
  revalidatePath("/shop");
  revalidatePath("/");
}
