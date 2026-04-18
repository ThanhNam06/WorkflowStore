import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WorkflowStore",
  description: "Bán workflow tự động với Sepay/PayPal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
