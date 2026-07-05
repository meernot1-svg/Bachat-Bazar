import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bachat Bazar - Pakistan's #1 Online Marketplace",
  description: "Shop the best deals on Health & Beauty, Grocery, Electronics, Fashion, Home Appliances and more. Free delivery on orders over Rs 25,000.",
  keywords: ["Bachat Bazar", "online shopping", "Pakistan", "deals", "electronics", "beauty", "fashion", "grocery"],
  authors: [{ name: "Bachat Bazar" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Bachat Bazar - Pakistan's #1 Online Marketplace",
    description: "Best prices on electronics, beauty, fashion & more",
    type: "website",
    siteName: "Bachat Bazar",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bachat Bazar",
    description: "Pakistan's #1 Online Marketplace",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
