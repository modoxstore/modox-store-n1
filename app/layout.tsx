import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import CartDrawer from "@/components/CartDrawer";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: {
    default: "MODOX STORE | إكسسوارات Gaming في المغرب",
    template: "%s | MODOX STORE",
  },

  description:
    "متجر MODOX لإكسسوارات Gaming ومبردات الهواتف في المغرب. جودة مضمونة، الدفع عند الاستلام والتوصيل لجميع المدن.",

  keywords: [
    "MODOX STORE",
    "مبرد الهاتف",
    "مبردات الهواتف",
    "إكسسوارات Gaming",
    "Gaming Maroc",
    "Phone Cooler Morocco",
    "Free Fire Morocco",
    "PUBG Morocco",
  ],

  authors: [
    {
      name: "MODOX STORE",
    },
  ],

  creator: "MODOX STORE",
  publisher: "MODOX STORE",

  openGraph: {
    title: "MODOX STORE | إكسسوارات Gaming",
    description:
      "مبردات هواتف وإكسسوارات Gaming بجودة مضمونة مع الدفع عند الاستلام.",
    type: "website",
    locale: "ar_MA",
    siteName: "MODOX STORE",
  },

  twitter: {
    card: "summary_large_image",
    title: "MODOX STORE",
    description:
      "مبردات هواتف وإكسسوارات Gaming في المغرب.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>

        <Analytics />
      </body>
    </html>
  );
}