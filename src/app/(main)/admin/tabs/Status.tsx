"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { status } from "@/types/api/status";
import { getStatusAPI } from "@/api/status/getStatus";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const STATUS_COLOR_HEX: Record<string, string> = {
  NOT_SUBMITTED: "#6b7280",
  SUBMITTED: "#1d4ed8",
  REJECTED: "#ef4444",
  APPROVED_WITH_FEEDBACK: "#f59e0b",
  FINAL: "#16a34a",
  APPROVED: "#16a34a",
  MISSED: "#ef4444",
  DEFAULT: "#6b7280",
};

function getStyleForCode(code?: string) {
  const color = (code && STATUS_COLOR_HEX[code]) || STATUS_COLOR_HEX.DEFAULT;
  const containerBg = `${color}10`;
  const badgeBg = `${color}22`;
  return {
    containerStyle: {
      borderColor: color,
      color,
      backgroundColor: containerBg,
    } as React.CSSProperties,
    badgeStyle: {
      backgroundColor: badgeBg,
      color,
      border: `1px solid ${color}33`,
    } as React.CSSProperties,
  };
}

// removed "Missed", added "Not Approved"
const ALL_STATUS = [
  "All",
  "Approved",
  "Submitted",
  "Not Submitted",
  "Not Approved",
] as const;

type StatusFilter = (typeof ALL_STATUS)[number];

function StatusTabContent() {
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

    // map UI filter labels to API status codes when needed
    if (statusFilter !== "All") {
      let statusParam: string | null = null;
      if (statusFilter === "Not Approved") {
        statusParam = "REJECTED";
      } else if (statusFilter === "Approved") {
        // map Approved UI to FINAL (server considers FINAL as approved)
        statusParam = "FINAL";
      } else {
        statusParam = statusFilter.toUpperCase().replace(/ /g, "_");
      }
      if (statusParam) options.status = statusParam;
    }

    getStatusAPI(courseId, options)
      .then(data => setStatusData(data))
      .catch(e => setError(e?.message || "Failed to fetch status"))
      .finally(() => setLoading(false));
  }, [assignmentId, groupId, statusFilter, courseId]);

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
    const uniqueGroups = Array.from(new Map(groups.map(g => [g.id, g])).values());
    return [{ id: "All", name: "All" }, ...uniqueGroups];
  }, [statusData, assignmentId]);

  const list = useMemo(() => {
    if (!statusData?.assignments) return [];
    let rows: {
      assignmentId: string;
      assignmentName: string;
      name: string;
      id: string;
      status: string;
      statusCode: string;
    }[] = [];
    for (const assignment of statusData.assignments) {
      for (const group of assignment.groups) {
        const statusLabel = (() => {
          // Map API codes to display labels:
          // FINAL/APPROVED -> Approved
          // REJECTED -> Not Approved
          switch (group.status) {
            case "FINAL":
            case "APPROVED":
              return "Approved";
            case "REJECTED":
              return "Not Approved";
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
            statusCode: group.status,
          });
        }
      }
    }
    return rows.sort((a, b) => a.name.localeCompare(b.name));
  }, [statusData, assignmentId, groupId, statusFilter]);

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

      {assignmentId === "All" ? (
        <>
          {!loading && !error && statusData?.assignments?.length === 0 && (
            <div className="rounded bg-white p-8 text-center text-gray-500 text-xl">No results.</div>
          )}

          {loading && (
            <div className="rounded bg-white p-8 text-center text-gray-500 text-xl">Loading...</div>
          )}
          {error && (
            <div className="rounded bg-white p-8 text-center text-red-500 text-xl">{error}</div>
          )}

          {!loading && !error && statusData?.assignments?.map((assignment) => (
            <div key={assignment.assignmentId} className="mb-6">
              <h3 className="font-bold text-lg text-gray-800 mb-3">{assignment.assignmentName}</h3>
              <div className="space-y-3">
                {assignment.groups && assignment.groups.length > 0 ? (
                  assignment.groups.map((group) => {
                    const statusLabel = (() => {
                      switch (group.status) {
                        case "FINAL": return "Approved";
                        case "APPROVED": return "Approved";
                        case "REJECTED": return "Not Approved";
                        case "SUBMITTED": return "Submitted";
                        case "NOT_SUBMITTED": return "Not Submitted";
                        case "MISSED": return "Missed";
                        default: return group.status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
                      }
                    })();
                    const sty = getStyleForCode(group.status);
                    return (
                      <div
                        key={group.groupId}
                        className="flex items-center justify-between rounded border px-4 py-3"
                        style={sty.containerStyle}
                      >
                        <div className="truncate text-xl">{group.projectName || group.codeNumber}</div>
                        <div className="flex items-center gap-4 ml-4 shrink-0">
                          <span className="rounded px-2 py-0.5 text-xl" style={sty.badgeStyle}>{statusLabel}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded bg-white p-4 text-center text-gray-500">No groups.</div>
                )}
              </div>
            </div>
          ))}
        </>
      ) : (
        <>
          <h3 className="font-bold text-xl text-gray-800 mb-3">{assignmentName}</h3>
          <div className="space-y-3">
            {loading && (
              <div className="rounded bg-white p-8 text-center text-gray-500 text-xl">Loading...</div>
            )}
            {error && (
              <div className="rounded bg-white p-8 text-center text-red-500 text-xl">{error}</div>
            )}
            {!loading && !error && list.map((row) => {
              const sty = getStyleForCode(row.statusCode);
              return (
                <div
                  key={`${row.assignmentId}-${row.id}`}
                  className="flex items-center justify-between rounded border px-4 py-3"
                  style={sty.containerStyle}
                >
                  <div className="truncate text-xl">{row.name}</div>
                  <div className="flex items-center gap-4 ml-4 shrink-0">
                    <span className="rounded px-2 py-0.5 text-xl" style={sty.badgeStyle}>{row.status}</span>
                  </div>
                </div>
              );
            })}
            {!loading && !error && list.length === 0 && (
              <div className="rounded bg-white p-8 text-center text-gray-500 text-xl">No results.</div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default function StatusTab() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-500">Loading status tab...</div>}>
      <StatusTabContent />
    </Suspense>
  );
}