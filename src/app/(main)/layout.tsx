import type { ReactNode } from "react";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white font-dbheavent h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="p-6 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}