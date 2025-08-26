// src/app/(main)/advisor/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { Pencil, CheckCircle2 } from "lucide-react";

/* ----------------------------- MOCK DATA ONLY ----------------------------- */
export const advisorMock = {
  advisor: {
    id: "advisor-001",
    name: "Dr. Vithida Chongsuphajaisiddhi",
  },
  course: {
    code: "CSC498-CSC499[2026]",
    description: "This class for CS",
    program: "CS",
    createdAt: "06/09/2025",
    createdBy: "Thanatat Wongabut",
  },
  counts: {
    totalStudents: 59,
    totalAdvisors: 12,
    totalGroups: 20,
    totalAssignments: 3,
  },
  submissionsBreakdown: [
    { label: "Not Submitted", value: 0, color: "#6b7280" },
    { label: "Submitted", value: 0, color: "#1d4ed8" },
    { label: "Missed", value: 0, color: "#ef4444" },
    { label: "Rejected", value: 0, color: "#f59e0b" },
    { label: "Approved with Feedback", value: 0, color: "#10b981" },
    { label: "Final", value: 6, color: "#16a34a" },
  ],
  assignments: [
    { id: "1", title: "Assignment 1" },
    { id: "2", title: "Assignment 2" },
    { id: "3", title: "Assignment 3" },
  ],
  alerts: [
    {
      id: "a1",
      title: "5 groups missed the submission for Assignment 1",
      desc: "",
      date: "01/04/2025, 08:00 AM",
    },
    {
      id: "a2",
      title: "Announcement Posted",
      desc: "New announcement posted by Thanatat Wongabut",
      date: "01/04/2025, 09:00 AM",
    },
  ],
  groups: [
    {
      id: "0001",
      projectTitle: "Hellohello system",
      productTitle: "Twomandown",
      members: [
        "65130500211 Navin Dansaikul",
        "65130500241 Mananchai Chankhuong",
        "65130500299 Cristiano Ronaldo",
      ],
      advisorId: "advisor-001",
      advisor: "Dr. Vithida Chongsuphajaisiddhi",
    },
    {
      id: "0002",
      projectTitle: "GPS system",
      productTitle: "BokLare",
      members: [
        "65130500212 Lamine Yamal",
        "65130500213 Lionel Messi",
        "65130500214 Rafael Leao",
      ],
      advisorId: "advisor-001",
      advisor: "Dr. Vithida Chongsuphajaisiddhi",
    },
    {
      id: "9999",
      projectTitle: "Other group (not mine)",
      productTitle: "-",
      members: ["1 Someone Else"],
      advisorId: "advisor-999",
      advisor: "Other Advisor",
    },
  ],
};

/* ------------------------------- PAGE (MOCK) ------------------------------ */
export default function Page() {
  const {
    advisor,
    course,
    counts,
    submissionsBreakdown,
    assignments,
    alerts,
    groups,
  } = advisorMock;

  const responsibleGroups = groups.filter((g) => g.advisorId === advisor.id);
  const total = submissionsBreakdown.reduce((s, i) => s + i.value, 0);
  const final = submissionsBreakdown.find((i) => i.label === "Final")?.value ?? 0;
  const percent = total ? Math.round((final / total) * 100) : 0;

  return (
    <main className="min-h-screen bg-white p-6 font-dbheavent">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="xl:col-span-2 space-y-6">
          {/* Class Info + Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Class Information */}
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 lg:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Class Information</h2>
              </div>
              <InfoRow label="Class Name" value={course.code} />
              <InfoRow label="Description" value={course.description} />
              <InfoRow label="Program Type" value={course.program} />
              <InfoRow label="Created Date" value={course.createdAt} />
              <InfoRow label="Created By" value={course.createdBy} />
            </section>

            {/* Dashboard */}
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
                  <Donut percent={percent} label="Submissions" total={`${total} Totals`} />
                </div>
                <ul className="space-y-2 text-lg">
                  {submissionsBreakdown.map((i) => (
                    <LegendItem
                      key={i.label}
                      color={i.color}
                      text={`${i.label}: ${i.value} (${
                        total === 0 ? 0 : Math.round((i.value / total) * 100)
                      }%)`}
                    />
                  ))}
                </ul>
              </div>

              <div className="mt-3">
                <Link href="#" className="text-lg text-[#326295] hover:underline">
                  More Detail
                </Link>
              </div>
            </section>
          </div>

          {/* Alerts */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-2xl font-semibold mb-4">Alerts</h2>
            <div className="divide-y">
              {alerts.map((a) => (
                <AlertRow
                  key={a.id}
                  icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
                  title={a.title}
                  desc={a.desc ?? ""}
                  date={a.date}
                />
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          {/* Summary */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-2xl font-semibold mb-4">Summary</h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-lg">
              <DT label="Total Students" value={String(counts.totalStudents)} />
              <DT label="Total Advisors" value={String(counts.totalAdvisors)} />
              <DT label="Total Groups" value={String(counts.totalGroups)} />
              <DT label="Total Assignments" value={String(counts.totalAssignments)} />
            </dl>
          </section>

          {/* Quick Actions */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
            <ul className="space-y-2 text-[#326295]">
              {assignments.map((a) => (
                <li key={a.id}>
                  <Link href="#" className="inline-flex items-center gap-2 hover:underline text-lg">
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Group Information (ONLY groups this advisor is responsible for) */}
          <section className="bg-white rounded-[20px] border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">Group Information</h2>
            </div>

            {responsibleGroups.length === 0 ? (
              <div className="text-lg text-gray-500">No assigned groups</div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {responsibleGroups.map((g) => (
                  <div key={g.id} className="rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-lg">ID: {g.id}</div>
                      <button className="p-2 rounded-md hover:bg-gray-100" aria-label="Edit group">
                        <Pencil className="h-5 w-5 text-gray-700" />
                      </button>
                    </div>

                    <div className="mt-3 space-y-2 text-gray-900">
                      <Field label="Project Title" value={g.projectTitle} />
                      <Field label="Product Title" value={g.productTitle || "-"} />
                      <Field label="Member">
                        <ul className="space-y-1 text-lg">
                          {g.members.map((m, i) => (
                            <li key={i}>{m}</li>
                          ))}
                        </ul>
                      </Field>
                      <Field label="Advisor" value={g.advisor || advisor.name} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

/* --------------------------------- UI bits -------------------------------- */
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
          {desc && <div className="text-lg text-gray-600">{desc}</div>}
          <Link href="#" className="text-lg text-[#326295] hover:underline">
            More Detail
          </Link>
        </div>
      </div>
      <div className="text-lg text-gray-500">{date}</div>
    </div>
  );
}
