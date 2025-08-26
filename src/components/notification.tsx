"use client";

import React from "react";
import { X } from "lucide-react";

export default function NotificationPopup({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed top-20 right-6 w-[360px] bg-white shadow-lg rounded-lg border z-50 font-dbheavent">
      <div className="flex items-center justify-between border-b p-4">
        <span className="text-lg font-semibold">Notification</span>
        <button onClick={onClose}>
          <X className="w-5 h-5 text-gray-700 hover:text-black" />
        </button>
      </div>

      <div className="p-4 space-y-1 text-sm">
        <p className="text-base font-medium">
          Assignment Missed{" "}
          <span className="text-xs text-gray-500">01/04/2025, 09:00 AM</span>
        </p>

        <p className="text-[13px] font-semibold">
          A01_V01: Profile [Kaijiew, Bameetomyum, VRZO]
        </p>

        <p className="text-[13px] text-gray-700 leading-snug">
          Kaijiew, Bameetomyum, VRZO have missed the submission deadline for Assignment A01.
        </p>
      </div>
    </div>
  );
}
