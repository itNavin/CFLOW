"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { name: "Twomandown", href: "/student" },
  { name: "Admin", href: "/admin" },
  { name: "Advisor", href: "/advisor" },
  { name: "Announcements", href: "/announcements" },
  { name: "Files", href: "/files" },
  { name: "Assignments", href: "/assignments" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 h-screen bg-white border-r">
      <nav className="flex flex-col py-6 space-y-2 font-dbheavent">
        {menuItems.map((item, index) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={index}
              href={item.href}
              className={`px-6 py-3 text-2xl font-semibold transition ${
                isActive
                  ? "bg-gradient-to-r from-[#326295] to-[#0a1c30] text-white"
                  : "text-black hover:bg-gray-100"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
