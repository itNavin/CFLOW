"use client";
import React from "react";
import Link from "next/link";

const advisorGroups = [
  { id: "group1", assignment: "A01: Chapters 1-3" },
  { id: "group2", assignment: "A02: Chapters 4-5" },
];

export default function AdvisorDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Advisor Panel</h1>
      <ul className="space-y-4">
        {advisorGroups.map((g, index) => (
          <li key={index} className="border p-4 rounded shadow-sm">
            <Link href={`/assignments/advisor/${g.id}`}>
              <div className="text-lg font-medium">{g.assignment}</div>
              <div className="text-sm text-gray-600">Group: {g.id}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
