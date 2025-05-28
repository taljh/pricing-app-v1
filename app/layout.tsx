import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import "../styles/rtl.css";
import { Providers } from "./providers";

const tajawal = Tajawal({ 
  subsets: ["latin", "arabic"], 
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: "تسعير - منصة تسعير المنتجات",
  description: "منصة متكاملة لتسعير المنتجات بذكاء وفعالية",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="light" style={{ colorScheme: "light" }}>
      <body className={`${tajawal.className} bg-white`} data-gptw="">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
