import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import CartDrawer from "@/components/CartDrawer";
import { Analytics } from "@vercel/analytics/next";
import {
  Chakra_Petch,
  IBM_Plex_Sans_Arabic,
  JetBrains_Mono,
  Lalezar,
  Saira_Stencil_One,
} from "next/font/google";

const stencil = Saira_Stencil_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-stencil",
  display: "swap",
});

const chakra = Chakra_Petch({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-chakra",
  display: "swap",
});

const plexArabic = IBM_Plex_Sans_Arabic({
  weight: ["400", "500", "600", "700"],
  subsets: ["arabic", "latin"],
  variable: "--font-plex-arabic",
  display: "swap",
});

const arabicDisplay = Lalezar({
  weight: "400",
  subsets: ["arabic", "latin"],
  variable: "--font-arabic-display",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

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

  // Google AdSense Verification
  other: {
    "google-adsense-account": "ca-pub-4947064544666047",
  },

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
    <html
      lang="ar"
      dir="rtl"
      className={`${stencil.variable} ${chakra.variable} ${plexArabic.variable} ${arabicDisplay.variable} ${jetbrains.variable}`}
    >
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
