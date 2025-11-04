import "./globals.css";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/toast";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      {/* Remove default browser body margin to avoid left gutter on some screens */}
      <body className="min-h-screen m-0 bg-[#f5f6fa] font-dbheavent">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
