import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { StructuredData } from "@/components/seo/StructuredData";

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#006233',
};

export const metadata: Metadata = {
  title: "Bachat Bazar | Pakistan's #1 Online Shopping Marketplace - Best Deals & Prices",
  description: "Bachat Bazar is Pakistan's leading online marketplace offering best prices on Health & Beauty, Grocery, Electronics, Fashion, Home Appliances, Baby Products & more. Free delivery on orders over Rs 25,000. Cash on Delivery available nationwide.",
  keywords: [
    "Bachat Bazar",
    "online shopping Pakistan",
    "Pakistan ecommerce",
    "best deals Pakistan",
    "electronics Pakistan",
    "beauty products Pakistan",
    "fashion online Pakistan",
    "grocery delivery Pakistan",
    "home appliances Pakistan",
    "mobile phones Pakistan",
    "laptops Pakistan",
    "cosmetics Pakistan",
    "baby products Pakistan",
    "COD shopping Pakistan",
    "free delivery Pakistan",
    "discounts Pakistan",
    "sale Pakistan",
    "Lahore online shopping",
    "Karachi online shopping",
    "Islamabad online shopping"
  ],
  authors: [{ name: "Bachat Bazar" }],
  creator: "Bachat Bazar",
  publisher: "Bachat Bazar",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://bachatbazar.pk",
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "Bachat Bazar | Pakistan's #1 Online Shopping Marketplace",
    description: "Shop best deals on Electronics, Beauty, Fashion, Grocery & more. Free delivery Rs 25K+. COD available.",
    type: "website",
    locale: "en_PK",
    url: "https://bachatbazar.pk",
    siteName: "Bachat Bazar",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Bachat Bazar - Pakistan's Online Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bachat Bazar | Pakistan's #1 Online Marketplace",
    description: "Best prices on electronics, beauty, fashion & more. Free delivery Rs 25K+",
    images: "/og-image.png",
    creator: "@bachatbazar",
  },
  verification: {
    google: "google2b6ce7b0becad346",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="geo.region" content="PK-PB" />
        <meta name="geo.placename" content="Lahore, Pakistan" />
        <meta name="geo.position" content="31.5204;74.3587" />
        <meta name="ICBM" content="31.5204, 74.3587" />
      </head>
      <body
        className={`${dmSans.variable} ${dmSerif.variable} antialiased bg-background text-foreground`}
      >
        <StructuredData />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
