import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coinbase Automated Trading Bot | Quant Dashboard",
  description: "Automated 5-minute quantitative algorithmic trading platform for Coinbase Advanced Trade.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#080b11] text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
