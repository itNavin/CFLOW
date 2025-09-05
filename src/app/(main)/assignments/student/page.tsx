"use client";
import React from "react";
import Link from "next/link";

const mockAssignments = [
  { id: "a01", title: "A01: Chapters 1-3", status: "Submitted" },
  { id: "a02", title: "A02: Chapters 4-5", status: "Pending" },
];

export default function StudentAssignments() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Your Assignments</h1>
      <ul className="space-y-4">
        {mockAssignments.map((a) => (
          <li key={a.id} className="border p-4 rounded shadow-sm">
            <Link href={`/assignments/student/${a.id}`} className="block">
              <div className="text-lg font-medium">{a.title}</div>
              <div className="text-sm text-gray-600">Status: {a.status}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
