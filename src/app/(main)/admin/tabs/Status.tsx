"use client";

import React, { useEffect, useMemo, useState } from "react";
import { status } from "@/types/api/status";
import { getStatusAPI } from "@/api/status/getStatus";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const statusStyles: Record<string, { container: string; badge: string }> = {
  Approved: {
    container: "bg-green-50 border-green-200 text-green-900 hover:bg-green-100",
    badge: "text-green-800 border-green-300 bg-green-100",
  },
  Submitted: {
    container: "bg-sky-50 border-sky-200 text-sky-900 hover:bg-sky-100",
    badge: "text-sky-800 border-sky-300 bg-sky-100",
  },
  "Not Submitted": {
    container: "bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100",
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
  const [assignmentId, setAssignmentId] = useState<string>("All");
  const [groupId, setGroupId] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  const [statusData, setStatusData] = useState<status.status | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId") || "";

  useEffect(() => {
    setLoading(true);
    setError(null);

    const options: Record<string, string> = {};
    if (assignmentId !== "All") options.assignmentId = assignmentId;
    if (groupId !== "All") options.groupId = groupId;
    if (statusFilter !== "All") options.status = statusFilter.toUpperCase().replace(/ /g, "_");

    getStatusAPI(courseId, options)
      .then(data => setStatusData(data))
      .catch(e => setError(e?.message || "Failed to fetch status"))
      .finally(() => setLoading(false));
  }, [assignmentId, groupId, statusFilter]);

  // Assignment options for select
  const assignmentOptions = useMemo(() => {
    if (!statusData?.assignments) return [{ id: "All", name: "All" }];
    return [
      { id: "All", name: "All" },
      ...statusData.assignments.map(a => ({
        id: a.assignmentId,
        name: a.assignmentName,
      })),
    ];
  }, [statusData]);

  // Group options for select
  const groupOptions = useMemo(() => {
    if (!statusData?.assignments) return [{ id: "All", name: "All" }];
    let groups: { id: string; name: string }[] = [];
    if (assignmentId === "All") {
      statusData.assignments.forEach(a => {
        a.groups.forEach(g => {
          groups.push({
            id: g.groupId,
            name: g.projectName || g.codeNumber,
          });
        });
      });
    } else {
      const assignment = statusData.assignments.find(a => a.assignmentId === assignmentId);
      assignment?.groups.forEach(g => {
        groups.push({
          id: g.groupId,
          name: g.projectName || g.codeNumber,
        });
      });
    }
    // Remove duplicates
    const uniqueGroups = Array.from(new Map(groups.map(g => [g.id, g])).values());
    return [{ id: "All", name: "All" }, ...uniqueGroups];
  }, [statusData, assignmentId]);

  // Filtered list for display
  const list = useMemo(() => {
    if (!statusData?.assignments) return [];
    let rows: {
      assignmentId: string;
      assignmentName: string;
      name: string;
      id: string;
      status: string;
    }[] = [];
    for (const assignment of statusData.assignments) {
      for (const group of assignment.groups) {
        const statusLabel = (() => {
          switch (group.status) {
            case "APPROVED":
              return "Approved";
            case "SUBMITTED":
              return "Submitted";
            case "NOT_SUBMITTED":
              return "Not Submitted";
            case "MISSED":
              return "Missed";
            default:
              return group.status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
          }
        })();

        if (
          (assignmentId === "All" || assignment.assignmentId === assignmentId) &&
          (groupId === "All" || group.groupId === groupId) &&
          (statusFilter === "All" || statusLabel === statusFilter)
        ) {
          rows.push({
            assignmentId: assignment.assignmentId,
            assignmentName: assignment.assignmentName,
            name: group.projectName || group.codeNumber,
            id: group.groupId,
            status: statusLabel,
          });
        }
      }
    }
    return rows.sort((a, b) => a.name.localeCompare(b.name));
  }, [statusData, assignmentId, groupId, statusFilter]);

  // Assignment name for header
  const assignmentName = useMemo(() => {
    if (assignmentId === "All") return "All Assignments";
    return assignmentOptions.find(a => a.id === assignmentId)?.name ?? "";
  }, [assignmentId, assignmentOptions]);

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
              {assignmentOptions.map((a) => (
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
              {groupOptions.map((g) => (
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

      <h3 className="font-bold text-xl text-gray-800 mb-3">{assignmentName}</h3>

      <div className="space-y-3">
        {loading && (
          <div className="rounded bg-white p-8 text-center text-gray-500 text-xl">
            Loading...
          </div>
        )}
        {error && (
          <div className="rounded bg-white p-8 text-center text-red-500 text-xl">
            {error}
          </div>
        )}
        {!loading && !error && list.map((row) => {
          const sty = statusStyles[row.status] || statusStyles["Missed"];
          return (
            <div
              key={`${row.assignmentId}-${row.id}`}
              className={`flex items-center justify-between rounded border px-4 py-3 ${sty.container}`}
            >
              <div className="truncate text-xl">{row.name}</div>
              <div className="flex items-center gap-4 ml-4 shrink-0">
                <span className={`rounded px-2 py-0.5 text-xl ${sty.badge}`}>
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
        {!loading && !error && list.length === 0 && (
          <div className="rounded bg-white p-8 text-center text-gray-500 text-xl">
            No results.
          </div>
        )}
      </div>
    </section>
  );
}