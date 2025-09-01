"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, CheckCircle2 } from "lucide-react";

type Course = {
  id: number;
  name: string;
  program: "CS" | "DSI";   
  description?: string; 
};

export default function StudentDashboard() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    // Get selected course from localStorage
    const courseData = localStorage.getItem('selectedCourse');
    if (courseData) {
      try {
        const course = JSON.parse(courseData);
        setSelectedCourse(course);
      } catch (err) {
        console.error('Error parsing course data:', err);
      }
    }
  }, []);

  // Use selected course data or fallback to default
  const courseInfo = selectedCourse || {
    name: "CSC498-CSC499[2026]",
    description: "This class for CS",
    program: "CS" as const
  };
  return (
    <main className="min-h-screen bg-white p-6 font-dbheavent">

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 lg:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Class Information</h2>
              </div>
              <InfoRow label="Class Name" value={courseInfo.name} />
              <InfoRow label="Description" value={courseInfo.description || "No description available"} />
              <InfoRow label="Program Type" value={courseInfo.program} />
              <InfoRow label="Created Date" value="06/09/2025" />
              <InfoRow label="Created By" value="Thanatat Wongabut" />
            </section>

            <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Dashboard</h2>
                <div className="flex items-center gap-3">
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
                  <Donut percent={100} label="Submissions" total="3 Totals" />
                </div>
                <ul className="space-y-2 text-lg">
                  <LegendItem color="#6b7280" text="Not Submitted: 0 (0%)" />
                  <LegendItem color="#1d4ed8" text="Submitted: 0 (0%)" />
                  <LegendItem color="#ef4444" text="Missed: 0 (0%)" />
                  <LegendItem color="#f59e0b" text="Rejected: 0 (0%)" />
                  <LegendItem color="#10b981" text="Approved with Feedback: 0 (0%)" />
                  <LegendItem color="#16a34a" text="Final: 3 (100%)" />
                </ul>
              </div>

              <div className="mt-3">
                <Link href="#" className="text-lg text-[#326295] hover:underline">
                  More Detail
                </Link>
              </div>
            </section>
          </div>

          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-2xl font-semibold mb-4">Alerts</h2>
            <div className="divide-y">
              <AlertRow
                icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
                title="Assignment Approved"
                desc="Assignment 3 has been marked as final. No further action is required."
                date="01/04/2025, 09:00 AM"
              />
              <AlertRow
                icon={<span className="text-xl">📨</span>}
                title="Announcement Posted"
                desc="New announcement posted by Thanatat Wongabut"
                date="01/04/2025, 09:00 AM"
              />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-2xl font-semibold mb-4">Summary</h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-lg">
              <DT label="Total Students" value="59" />
              <DT label="Total Advisors" value="12" />
              <DT label="Total Groups" value="20" />
              <DT label="Total Assignments" value="3" />
            </dl>
          </section>
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
            <ul className="space-y-2 text-[#326295]">
              <li>
                <Link href="/assignments/1" className="inline-flex items-center gap-2 hover:underline text-lg">
                  Assignment 1
                </Link>
              </li>
              <li>
                <Link href="/assignments/2" className="inline-flex items-center gap-2 hover:underline text-lg">
                  Assignment 2
                </Link>
              </li>
              <li>
                <Link href="/assignments/3" className="inline-flex items-center gap-2 hover:underline text-lg">
                  Assignment 3
                </Link>
              </li>
            </ul>
          </section>

          <GroupInformationCard
            data={{
              id: "0001",
              projectTitle: "Hellohello system",
              productTitle: "Twomandown",
              members: [
                "65130500211 Navin Dansaikul",
                "65130500241 Mananchai Chankhoung",
                "65130500299 Cristiano Ronaldo",
              ],
              advisor: "Dr. Vithida Chongsuphajaisiddhi",
            }}
            onEdit={() => console.log("Edit group")}
          />
        </div>
      </div>
    </main>
  );
}

function GroupInformationCard({
  data,
  onEdit,
}: {
  data: {
    id: string;
    projectTitle: string;
    productTitle: string;
    members: string[];
    advisor: string;
  };
  onEdit?: () => void;
}) {
  return (
    <section className="bg-white rounded-[20px] border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-900">Group Information</h2>
        <button
          onClick={onEdit}
          className="p-2 rounded-md hover:bg-gray-100"
          aria-label="Edit group"
        >
          <Pencil className="h-5 w-5 text-gray-700" />
        </button>
      </div>

      <div className="space-y-4 text-gray-900">
        <Field label="ID" value={data.id} />
        <Field label="Project Title" value={data.projectTitle} />
        <Field label="Product Title" value={data.productTitle} />

        <Field label="Member">
          <ul className="space-y-1 text-lg">
            {data.members.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </Field>

        <Field label="Advisor" value={data.advisor} />
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <div className="font-bold text-lg text-gray-900">{label}</div>
      {value ? <div className="text-lg text-gray-900">{value}</div> : children}
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