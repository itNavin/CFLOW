"use client";

import React from "react";
import Link from "next/link";
import { Pencil, AlertTriangle, FilePlus2, Megaphone, Upload } from "lucide-react";

export default function CourseTab() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Class Information</h2>
              <button className="p-2 rounded-md hover:bg-gray-100">
                <Pencil className="w-4 h-4 text-gray-700" />
              </button>
            </div>
            <InfoRow label="Class Name" value="CSC498-CSC499[2026]" />
            <InfoRow label="Description" value="This class for CS" />
            <InfoRow label="Program Type" value="CS" />
            <InfoRow label="Created Date" value="06/09/2025" />
            <InfoRow label="Created By" value="Thanatat Wongabut" />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Dashboard</h2>
              <div className="flex gap-3">
                <label className="text-xl text-gray-600">Filter</label>
                <select className="block border border-gray-300 rounded px-2 py-1 text-lg">
                  <option>Overall</option>
                  <option>Upcoming Due Dates</option>
                  <option>Upcoming End Dates</option>
                  <option>Custom Filter</option>
                </select>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="flex items-center justify-center">
                <Donut percent={75} label="Submissions" total="60 Totals" />
              </div>
              <ul className="space-y-2 text-lg">
                <LegendItem color="#6b7280" text="Not Submitted: 5 (8%)" />
                <LegendItem color="#1d4ed8" text="Submitted: 8 (12%)" />
                <LegendItem color="#ef4444" text="Missed: 0 (0%)" />
                <LegendItem color="#f59e0b" text="Rejected: 1 (1%)" />
                <LegendItem color="#10b981" text="Approved with Feedback: 2 (2%)" />
                <LegendItem color="#16a34a" text="Final: 44 (75%)" />
              </ul>
            </div>

            <div className="mt-3">
              <Link href="#" className="text-lg text-[#326295] hover:underline">
                More Detail
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-2xl font-semibold mb-4">Alerts</h2>
          <div className="divide-y">
            <AlertRow
              icon={<AlertTriangle className="w-6 h-6 text-yellow-600" />}
              title="Assignment Missed"
              desc="5 groups missed the submission for Assignment 1"
              date="01/04/2025, 09:00 AM"
            />
            <AlertRow
              icon={<span className="text-2xl">📣</span>}
              title="Announcement Posted"
              desc="New announcement posted by Thanatat Wongabut"
              date="01/04/2025, 09:00 AM"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-2xl font-semibold mb-4">Summary</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-lg">
            <DT label="Total Students" value="59" />
            <DT label="Total Advisors" value="12" />
            <DT label="Total Groups" value="20" />
            <DT label="Total Assignments" value="3" />
          </dl>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
          <ul className="space-y-2 text-[#326295] text-lg">
            <li>
              <Link href="/assignments/new" className="hover:underline inline-flex items-center gap-2">
                <FilePlus2 className="w-5 h-5" /> Create Assignment
              </Link>
            </li>
            <li>
              <Link href="/announcements/new" className="hover:underline inline-flex items-center gap-2">
                <Megaphone className="w-5 h-5" /> Create Announcement
              </Link>
            </li>
            <li>
              <Link href="/files/new" className="hover:underline inline-flex items-center gap-2">
                <Upload className="w-5 h-5" /> Upload File
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-2">
      <div className="text-lg font-bold text-gray-900">{label}</div>
      <div className="text-lg text-gray-900">{value}</div>
    </div>
  );
}

function DT({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-lg font-bold text-gray-900">{label}</dt>
      <dd className="text-lg text-gray-900">{value}</dd>
    </>
  );
}

function LegendItem({ color, text }: { color: string; text: string }) {
  return (
    <li className="flex items-center gap-2">
      <span className="inline-block w-4 h-4 rounded-sm" style={{ backgroundColor: color }} />
      <span className="text-lg font-bold">{text}</span>
    </li>
  );
}

function Donut({ percent, label, total }: { percent: number; label: string; total: string }) {
  const angle = Math.round((percent / 100) * 360);
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative w-48 h-48 rounded-full"
        style={{ background: `conic-gradient(#16a34a ${angle}deg, #e5e7eb 0deg)` }}
      >
        <div className="absolute inset-4 bg-white rounded-full grid place-items-center">
          <div className="text-center">
            <div className="text-3xl font-bold">{percent}%</div>
            <div className="text-lg text-gray-500">{label}</div>
          </div>
        </div>
      </div>
      <div className="mt-2 text-lg text-gray-600">{total}</div>
    </div>
  );
}

function AlertRow({
  icon,
  title,
  desc,
  date,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  date: string;
}) {
  return (
    <div className="py-3 flex items-start justify-between">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div>
          <div className="font-semibold text-lg">{title}</div>
          <div className="text-lg text-gray-600">{desc}</div>
          <Link href="#" className="text-lg text-[#326295] hover:underline">
            More Detail
          </Link>
        </div>
      </div>
      <div className="text-lg text-gray-500">{date}</div>
    </div>
  );
}
