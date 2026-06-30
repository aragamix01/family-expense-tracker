import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Family Tracker",
  description: "Track family shared expenses easily",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" style={{ background: "#FFF8F5" }}>{children}</body>
    </html>
  );
}
