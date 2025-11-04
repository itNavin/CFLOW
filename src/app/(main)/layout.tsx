import type { ReactNode } from "react";
import { Suspense } from "react";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white font-dbheavent h-screen flex flex-col">
      <Suspense fallback={<div className="h-16 w-full bg-white shadow-sm" />}>
        <Navbar />
      </Suspense>
      <div className="flex flex-1 min-h-0">
        <Suspense fallback={<div className="w-64 shrink-0 bg-white shadow-inner" />}>
          <Sidebar />
        </Suspense>
  <main className="p-6 flex-1 overflow-auto main-content">{children}</main>
      </div>
    </div>
  );
}
