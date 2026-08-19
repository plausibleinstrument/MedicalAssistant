import type { Metadata } from "next";
import { Archivo, Tiro_Devanagari_Hindi } from "next/font/google";
import "./globals.css";

const sans = Archivo({ subsets: ["latin"], variable: "--font-sans" });
const deva = Tiro_Devanagari_Hindi({ subsets: ["devanagari"], weight: "400", variable: "--font-deva" });

export const metadata: Metadata = {
  title: "Papa's Medical Helper",
  description: "Private family archive of medical bills, prescriptions, and test reports.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${deva.variable} font-sans`}>{children}</body>
    </html>
  );
}
