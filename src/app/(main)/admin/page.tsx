"use client";

import React, { useState } from "react";
import CourseTab from "./tabs/Course";
import AdvisorTab from "./tabs/Advisor";
import StudentTab from "./tabs/Student";
import GroupTab from "./tabs/Group";
import StatusTab from "./tabs/Status";
import AdminTab from "./tabs/Admin";

const TABS = ["Course", "Admin", "Advisor", "Student", "Group", "Status"] as const;
type Tab = typeof TABS[number];

export default function AdminPage() {
  const [active, setActive] = useState<Tab>("Course");

  return (
    <main className="min-h-screen bg-white p-6 font-dbheavent">
      <div className="flex gap-6 border-b text-2xl font-semibold mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={`pb-2 transition ${
              active === t
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-black"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {active === "Course" && <CourseTab />}
      {active === "Admin" && <AdminTab />}
      {active === "Advisor" && <AdvisorTab />}
      {active === "Student" && <StudentTab />}
      {active === "Group" && <GroupTab />}
      {active === "Status" && <StatusTab />}
    </main>
  );
}

function Placeholder({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-700">{desc}</p>
    </div>
  );
}
