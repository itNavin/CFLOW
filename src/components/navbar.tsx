"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Bell, Home, User } from "lucide-react";
import { useRouter } from "next/navigation";
import NotificationPopup from "./notification"; // adjust path as needed

export default function Navbar() {
  const [showNotification, setShowNotification] = useState(false);
  const router = useRouter();

  return (
    <>
      <div className="w-full flex items-center justify-between px-6 py-3 bg-white border-b shadow-sm font-dbheavent">
        <div className="flex items-center gap-4">
          <Image src="/image/SIT-LOGO.png" alt="SIT Logo" width={230} height={40} />
          <span className="text-4xl font-semibold">CSC498-CSC499[2026]</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative cursor-pointer" onClick={() => setShowNotification(!showNotification)}>
            <Bell className="w-6 h-6 text-black" />
            <span className="absolute -top-1 -right-2 text-[10px] px-1 bg-red-600 text-white rounded-full">15</span>
          </div>
          <Home className="w-6 h-6 text-black cursor-pointer" onClick={() => router.push("/course")} />
          <User className="w-6 h-6 text-black cursor-pointer" onClick={() => router.push("/profile")} />
        </div>
      </div>

      {showNotification && <NotificationPopup onClose={() => setShowNotification(false)} />}
    </>
  );
}
