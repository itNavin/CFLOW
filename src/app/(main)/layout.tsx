import type { ReactNode } from "react";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white font-dbheavent min-h-screen">
          <Navbar />
          <div className="flex">
            <Sidebar />
        <main className="p-6 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
