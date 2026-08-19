import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dad's Medical Records",
  description: "Private family archive of medical bills, prescriptions, and test reports.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
