import { savePromotion } from "../promotionAction";
import ProductImageInput from "../ProductImageInput";
import { uploadProductImage } from "../uploadProductImage";
import { requireAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  createAdminProduct,
  updateAdminProduct,
  toggleAdminProduct,
} from "../productActions";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdmin();

  const [productsResult, ordersResult] = await Promise.all([
    supabaseAdmin.from("products")
      .select("id,name,description,price,stock,image,active,ozon_ref,old_price,promo_end")
      .order("name"),
    supabaseAdmin.from("orders")
      .select("id", { count: "exact", head: true })
      .eq("source", "modox_v2"),
  ]);

  if (productsResult.error || ordersResult.error) {
    console.error("ADMIN PRODUCTS ERROR:", productsResult.error);
    console.error("ADMIN ORDERS ERROR:", ordersResult.error);
    throw new Error("Could not load admin dashboard. Check terminal logs.");
  }

  const products = productsResult.data ?? [];
  const active = products.filter(p => p.active).length;

  const input =
    "w-full rounded-xl border border-white/10 bg-[#080d0a] p-3 text-white outline-none focus:border-green-400";

  return (
    <main dir="rtl" className="min-h-screen bg-[#050807] p-5 text-white md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 border-b border-green-500/20 pb-6">
          <h1 className="text-3xl font-black text-green-400">
            MODOX ADMIN V2
          </h1>
          <p className="mt-2 text-zinc-400">
            إدارة المنتجات والطلبات الجديدة
          </p>
        </header>

        <div className="mb-5"><a href="/admin" className="text-green-400">← Dashboard</a></div>
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <a
            href="#products-management"
            className="flex items-center justify-between rounded-2xl border border-green-500/30 bg-[#101713] p-6 transition hover:bg-green-500/10"
          >
            <div>
              <h2 className="text-xl font-black text-green-400">
                Gestion des Produits
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                إضافة المنتجات وتعديل الأثمنة والصور والمخزون
              </p>
            </div>
            <span className="text-3xl">📦</span>
          </a>

          <a
            href="/admin/orders"
            className="flex items-center justify-between rounded-2xl border border-green-500/30 bg-[#101713] p-6 transition hover:bg-green-500/10"
          >
            <div>
              <h2 className="text-xl font-black text-green-400">
                Gestion des Commandes
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                الطلبات الجديدة والتفاصيل وحالة الشحن
              </p>
            </div>
            <span className="text-3xl">🛒</span>
          </a>
        </div>
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            { title: "طلبات V2", value: ordersResult.count ?? 0 },
            { title: "جميع المنتجات", value: products.length },
            { title: "منتجات ظاهرة", value: active },
          ].map(card => (
            <div key={card.title}
              className="rounded-2xl border border-green-500/20 bg-[#101713] p-5">
              <p className="text-zinc-400">{card.title}</p>
              <p className="mt-3 text-3xl font-black text-green-400">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        <section id="products-management" className="mb-8 rounded-2xl border border-green-500/20 bg-[#101713] p-6">
          <h2 className="mb-2 text-xl font-black text-green-400">
            + إضافة منتج جديد
          </h2>
          <p className="mb-5 text-sm text-zinc-400">
            المنتج الجديد كيتسجل مخفي حتى تراجعو وتفعّلو.
          </p>
          <form action={createAdminProduct}
            className="grid gap-3 md:grid-cols-2">
            <input name="name" required placeholder="اسم المنتج" className={input}/>
            <input name="price" type="number" min="0" required placeholder="الثمن DH" className={input}/>
            <input name="stock" type="number" min="0" required placeholder="الكمية" className={input}/>
            <ProductImageInput required />
            <input name="ozon_ref" placeholder="Ozon Reference (اختياري)" className={input}/>
            <input name="description" placeholder="الوصف" className={input}/>
            <button type="submit"
              className="rounded-xl bg-green-400 p-3 font-black text-black md:col-span-2">
              حفظ المنتج
            </button>
          </form>
        </section>

        <section>
          <h2 className="mb-5 text-2xl font-black">
            إدارة المنتجات ({products.length})
          </h2>
          <div className="grid gap-5 lg:grid-cols-2">
            {products.map(product => (
              <article key={product.id}
                className="rounded-2xl border border-white/10 bg-[#101713] p-5">
                <div className="mb-4 flex items-center gap-3">
                  {product.image ? (
                    // Admin previews configured image paths
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.image}
                      alt={product.name}
                      className="h-16 w-16 rounded-lg bg-black object-contain"/>
                  ) : (
                    <div className="h-16 w-16 rounded-lg bg-black"/>
                  )}
                  <div>
                    <h3 className="font-bold">{product.name}</h3>
                    <p className="text-sm text-green-400">
                      {product.price} DH · Stock: {product.stock}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {product.active ? "ظاهر" : "مخفي"}
                    </p>
                  </div>
                </div>

                <form
                  action={uploadProductImage}
                  encType="multipart/form-data"
                  className="mb-4 rounded-xl border border-green-500/20 p-4"
                >
                  <input type="hidden" name="id" value={product.id}/>
                  <label className="mb-2 block text-sm font-bold text-green-400">
                    رفع صورة المنتج</label>
                  <ProductImageInput required />
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-green-400 p-3 font-bold text-black"
                  >
                    رفع الصورة وحفظها
                  </button>
                </form>
                <form action={updateAdminProduct}
                  className="grid gap-3 sm:grid-cols-2">
                  <input type="hidden" name="id" value={product.id}/>
                  <label className="text-xs text-zinc-400">
                    الاسم
                    <input name="name" defaultValue={product.name}
                      required className={input}/>
                  </label>
                  <label className="text-xs text-zinc-400">
                    الثمن
                    <input name="price" type="number" min="0"
                      defaultValue={product.price} required className={input}/>
                  </label>
                  <label className="text-xs text-zinc-400">
                    الستوك
                    <input name="stock" type="number" min="0"
                      defaultValue={product.stock ?? 0} required className={input}/>
                  </label>
                  <label className="text-xs text-zinc-400">
                    Ozon Reference
                    <input name="ozon_ref" defaultValue={product.ozon_ref ?? ""}
                      className={input}/>
                  </label>
                  <label className="text-xs text-zinc-400 sm:col-span-2">
                    مسار الصورة أو الرابط
                    <input name="image" defaultValue={product.image ?? ""}
                      className={input}/>
                  </label>
                  <label className="text-xs text-zinc-400 sm:col-span-2">
                    الوصف
                    <textarea name="description"
                      defaultValue={product.description ?? ""}
                      rows={2} className={input}/>
                  </label>
                  <button type="submit"
                    className="rounded-xl bg-green-400 p-3 font-bold text-black sm:col-span-2">
                    حفظ التعديلات
                  </button>
                </form>

                <form action={savePromotion} className="mt-4 grid gap-3 rounded-xl border border-green-500/20 p-4 sm:grid-cols-2">
                  <h4 className="font-bold text-green-400 sm:col-span-2">العروض والتخفيضات</h4>
                  <input type="hidden" name="id" value={product.id} />
                  <label className="text-sm">ثمن البيع<input type="number" name="price" min="0" required defaultValue={product.price} className={input}/></label>
                  <label className="text-sm">الثمن المشطوب<input type="number" name="old_price" min="0" defaultValue={product.old_price ?? ""} className={input}/></label>
                  <label className="text-sm sm:col-span-2">نهاية العرض<input type="datetime-local" name="promo_end" defaultValue={product.promo_end ? new Date(new Date(product.promo_end).getTime() - new Date(product.promo_end).getTimezoneOffset()*60000).toISOString().slice(0,16) : ""} className={input}/></label>
                  <p className="text-xs text-zinc-400 sm:col-span-2">لحذف العرض فرغ الثمن المشطوب وتاريخ النهاية. ثمن البيع هو السعر المعتمد في Checkout.</p>
                  <button type="submit" className="rounded-xl bg-green-400 p-3 font-bold text-black sm:col-span-2">حفظ العرض</button>
                </form>
                <form action={toggleAdminProduct} className="mt-3">
                  <input type="hidden" name="id" value={product.id}/>
                  <input type="hidden" name="active"
                    value={String(product.active)}/>
                  <button type="submit"
                    className="w-full rounded-xl border border-white/20 p-3 text-sm">
                    {product.active ? "إخفاء المنتج" : "إظهار المنتج"}
                  </button>
                </form>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
