"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";

export type Status = "Approved" | "Submitted" | "Not Submitted" | "Missed";

export type Assignment = {
  id: string;
  name: string;
};

export type GroupStatus = {
  id: string;
  name: string;
  assignmentId: string;
  status: Status;
};

const ASSIGNMENTS: Assignment[] = [
  { id: "a1", name: "01_Profile" },
  { id: "a2", name: "02_Proposal" },
  { id: "a3", name: "03_Progress Report" },
];

const GROUPS: { id: string; name: string }[] = [
  { id: "g1", name: "VRZO" },
  { id: "g2", name: "Bameetomyum" },
  { id: "g3", name: "Kaijiew" },
  { id: "g4", name: "StickerYeah" },
];

const GROUP_STATUSES: GroupStatus[] = [
  { id: "g1", name: "VRZO", assignmentId: "a1", status: "Missed" },
  { id: "g2", name: "Bameetomyum", assignmentId: "a1", status: "Missed" },
  { id: "g3", name: "Kaijiew", assignmentId: "a1", status: "Missed" },
  { id: "g1", name: "VRZO", assignmentId: "a2", status: "Submitted" },
  { id: "g2", name: "Bameetomyum", assignmentId: "a2", status: "Not Submitted" },
  { id: "g3", name: "Kaijiew", assignmentId: "a2", status: "Approved" },
  { id: "g4", name: "StickerYeah", assignmentId: "a2", status: "Submitted" },
  { id: "g1", name: "VRZO", assignmentId: "a3", status: "Not Submitted" },
  { id: "g2", name: "Bameetomyum", assignmentId: "a3", status: "Submitted" },
  { id: "g3", name: "Kaijiew", assignmentId: "a3", status: "Approved" },
];

const statusStyles: Record<Status, { container: string; badge: string }> = {
  Approved: {
    container:
      "bg-green-50 border-green-200 text-green-900 hover:bg-green-100",
    badge:
      "text-green-800 border-green-300 bg-green-100",
  },
  Submitted: {
    container:
      "bg-sky-50 border-sky-200 text-sky-900 hover:bg-sky-100",
    badge: "text-sky-800 border-sky-300 bg-sky-100",
  },
  "Not Submitted": {
    container:
      "bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100",
    badge: "text-amber-800 border-amber-300 bg-amber-100",
  },
  Missed: {
    container: "bg-rose-50 border-rose-200 text-rose-900 hover:bg-rose-100",
    badge: "text-rose-800 border-rose-300 bg-rose-100",
  },
};

const ALL_STATUS = [
  "All",
  "Approved",
  "Submitted",
  "Not Submitted",
  "Missed",
] as const;

type StatusFilter = (typeof ALL_STATUS)[number];

export default function StatusTab() {
  const [assignmentId, setAssignmentId] = useState<string>(ASSIGNMENTS[0].id);
  const [groupId, setGroupId] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Missed");

  const assignment = useMemo(
    () => ASSIGNMENTS.find((a) => a.id === assignmentId)?.name ?? "",
    [assignmentId]
  );

  const groupsForAssignment = useMemo(() => {
    const ids = GROUP_STATUSES.filter((gs) => gs.assignmentId === assignmentId).map(
      (gs) => gs.id
    );
    const uniqueIds = Array.from(new Set(ids));
    return [
      { id: "All", name: "All" },
      ...GROUPS.filter((g) => uniqueIds.includes(g.id)),
    ];
  }, [assignmentId]);

  const list = useMemo(() => {
    let rows = GROUP_STATUSES.filter((gs) => gs.assignmentId === assignmentId);

    if (groupId !== "All") rows = rows.filter((gs) => gs.id === groupId);

    if (statusFilter !== "All")
      rows = rows.filter((gs) => gs.status === statusFilter);

    return rows.sort((a, b) => a.name.localeCompare(b.name));
  }, [assignmentId, groupId, statusFilter]);

  return (
    <section className="min-h-[60vh]">
      <div className="flex flex-wrap items-center gap-4 mb-5 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-900 text-xl">Assignment :</span>
          <div className="relative">
            <select
              value={assignmentId}
              onChange={(e) => {
                setAssignmentId(e.target.value);
                setGroupId("All");
              }}
              className="appearance-none rounded border border-gray-300 bg-white text-xl py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-[#326295]"
            >
              {ASSIGNMENTS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">▼</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-900 text-xl">Group :</span>
          <div className="relative">
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="appearance-none rounded border border-gray-300 bg-white text-xl py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-[#326295] min-w-[10rem]"
            >
              {groupsForAssignment.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">▼</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-900 text-xl">Status :</span>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="appearance-none rounded border border-gray-300 bg-white text-xl py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-[#326295]"
            >
              {ALL_STATUS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">▼</span>
          </div>
        </div>
      </div>

      <h3 className="font-bold text-xl text-gray-800 mb-3">{assignment}</h3>

      <div className="space-y-3">
        {list.map((row) => {
          const sty = statusStyles[row.status];
          return (
            <div
              key={`${row.assignmentId}-${row.id}`}
              className={`flex items-center justify-between rounded border px-4 py-3 ${sty.container}`}
            >
              <div className="truncate text-xl">{row.name}</div>

              <div className="flex items-center gap-4 ml-4 shrink-0">
                <span className={`rounded px-2 py-0.5 text-xl`}>
                  {row.status}
                </span>
                <Link
                  href={`/admin/status/${row.id}/${row.assignmentId}`}
                  className="text-xl text-[#326295] hover:underline"
                >
                  Detail
                </Link>
              </div>
            </div>
          );
        })}

        {list.length === 0 && (
          <div className="rounded bg-white p-8 text-center text-gray-500 text-xl">
            No results.
          </div>
        )}
      </div>
    </section>
  );
}
