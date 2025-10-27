import "./globals.css";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/toast";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f5f6fa] font-dbheavent">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
