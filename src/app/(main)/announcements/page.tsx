"use client";

import React from "react";
import Link from "next/link";
import { MoreHorizontal, Plus } from "lucide-react";

const announcements = [
  {
    id: 1,
    author: "Thanatat Wongabut",
    date: "4/18/2025 9:00 AM",
    message:
      "C-FLOW (Capstone FLOW) is a web-based platform designed to manage and streamline the entire capstone report submission and review workflow for students and professors. It helps solve common pain points such as confusion over report versions, lost feedback, unclear deadlines, and poor visibility of project progress.",
    files: [
      "PDFfile.pdf",
      "PDFfileonetwothreefourfivexsiexseveneightnine.pdf",
    ],
  },
  {
    id: 2,
    author: "Thanatat Wongabut",
    date: "4/21/2025 9:51 AM",
    message:
      "C-FLOW (Capstone FLOW) is a web-based platform designed to manage and streamline the entire capstone report submission and review workflow for students and professors. It helps solve common pain points such as confusion over report versions, lost feedback, unclear deadlines, and poor visibility of project progress.",
    files: [
      "222PDFfile222.pdf",
      "222fileonetwothreefourfivexsiexseveneightnine.pdf",
    ],
  },
];

export default function AnnouncementPage() {
  return (
    <main className="min-h-screen p-6 pb-28 font-dbheavent space-y-8">
      {announcements.map((a) => (
        <div
          key={a.id}
          className="bg-white rounded-md shadow p-6 space-y-4 border border-gray-200"
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-semibold">{a.author}</div>
              <div className="text-base text-gray-500">{a.date}</div>
            </div>
          </div>

          <p className="text-xl text-gray-800 leading-relaxed">{a.message}</p>

          <div className="space-y-3">
            {a.files.map((file, i) => (
              <div
                key={i}
                className="flex items-center justify-between border border-gray-300 px-4 py-3 rounded-md text-base text-black bg-[#f8f8f8]"
              >
                <span className="truncate w-[85%]">{file}</span>
                <button>
                  <MoreHorizontal className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <Link
        href="/announcements/new"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-4 py-3 shadow
                   bg-gradient-to-r from-[#326295] to-[#0a1c30] text-white text-[16px] font-medium
                   hover:from-[#28517c] hover:to-[#071320] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#326295]
                   active:scale-[0.98] transition"
      >
        <Plus className="h-5 w-5" />
        <span className="hidden sm:inline">Add New Announcement</span>
      </Link>
    </main>
  );
}
