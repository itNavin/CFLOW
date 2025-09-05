"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { getAssignmentByOpenTaskandSubmittedAPI } from "@/api/assignment/getAllAssignments";
import type { getAllAssignments } from "@/types/api/assignment";

type CardAssignment = {
  id: number;
  title: string;
  dueDate: string; // e.g., "9:00 PM"
  status: "missed" | "upcoming" | "submitted" | "approved";
  dateGroup: string; // e.g., "20 April"
};

export default function AssignmentPage() {
  const [activeTab, setActiveTab] = useState<"open" | "submitted">("open");
  const courseId = useSearchParams().get("courseId") || "";
  const groupId = useSearchParams().get("groupId") || "";

  const [data, setData] =
    useState<getAllAssignments.AssignmentbyOpenTaskandSubmitted | null>(null);
  const [loading, setLoading] = useState(false);

  // ---- helpers: date picking + formatting ----
  const pickRelevantDateISO = (a: {
    dueDate: string | null;
    endDate: string;
    schedule: string | null;
  }) => a.dueDate ?? a.schedule ?? a.endDate;

  const formatDateGroup = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
    });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });

  const computeOpenStatus = (dueISO: string | null): "missed" | "upcoming" => {
    if (!dueISO) return "upcoming";
    return new Date(dueISO).getTime() < Date.now() ? "missed" : "upcoming";
  };

  // ---- fetch ----
  const fetchAssignments = async () => {
    try {
      if (!courseId || !groupId) return;
      const cid = Number(courseId);
      const gid = Number(groupId);
      if (!Number.isFinite(cid) || !Number.isFinite(gid)) return;
      setLoading(true);
      const response = await getAssignmentByOpenTaskandSubmittedAPI(cid, gid);
      setData(response.data);
    } catch (e) {
      console.error("Failed to fetch assignments", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, groupId]);

  // ---- map backend -> cards ----
  const openCards: CardAssignment[] = useMemo(() => {
    if (!data) return [];
    return data.openTasks.map((a) => {
      const whenISO = pickRelevantDateISO(a);
      const dateGroup = formatDateGroup(whenISO);
      const status = computeOpenStatus(a.dueDate);
      return {
        id: a.id,
        title: a.name,
        dueDate: formatTime(whenISO),
        status,
        dateGroup,
      };
    });
  }, [data]);

  const submittedCards: CardAssignment[] = useMemo(() => {
    if (!data) return [];
    return data.submitted.map((a) => {
      const whenISO = pickRelevantDateISO(a);
      const dateGroup = formatDateGroup(whenISO);
      // We don’t have per-submission status in this payload; mark as submitted
      return {
        id: a.id,
        title: a.name,
        dueDate: formatTime(whenISO),
        status: "submitted",
        dateGroup,
      };
    });
  }, [data]);

  // ---- UI helpers ----
  const getCardStyle = (status: CardAssignment["status"]) => {
    switch (status) {
      case "missed":
        return "bg-red-100 border border-red-300";
      case "upcoming":
        return "bg-orange-100 border border-orange-200";
      case "submitted":
        return "bg-green-100 border border-green-300";
      case "approved":
        return "bg-green-100 border border-green-300";
      default:
        return "bg-white border border-gray-300";
    }
  };

  const groupedAssignments = (data: CardAssignment[]) =>
    data.reduce((acc: Record<string, CardAssignment[]>, curr) => {
      (acc[curr.dateGroup] ||= []).push(curr);
      return acc;
    }, {});

  const displayedData = activeTab === "open" ? openCards : submittedCards;

  const grouped = groupedAssignments(displayedData);

  return (
    <main className="min-h-screen bg-white p-6 font-dbheavent">
      <div className="flex gap-6 border-b text-2xl font-semibold mb-6">
        <button
          className={`pb-2 ${
            activeTab === "open"
              ? "border-b-2 border-black text-black"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("open")}
        >
          Open Tasks{data ? ` (${data.counts.open})` : ""}
        </button>
        <button
          className={`pb-2 ${
            activeTab === "submitted"
              ? "border-b-2 border-black text-black"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("submitted")}
        >
          Submitted{data ? ` (${data.counts.submitted})` : ""}
        </button>
      </div>

      {loading && <div className="text-gray-500">Loading assignments…</div>}

      {!loading && displayedData.length === 0 && (
        <div className="text-gray-500">
          {activeTab === "open"
            ? "No open tasks for this group."
            : "No submitted assignments yet."}
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(grouped).map(([date, tasks]) => (
          <div key={date}>
            <div className="text-2xl font-semibold mb-3">{date}</div>
            {tasks.map((task) => (
              <Link href={`/assignments/${task.id}`} key={task.id}>
                <div
                  className={`${getCardStyle(
                    task.status
                  )} p-5 rounded-md shadow-sm mb-2 cursor-pointer hover:shadow-md transition`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-xl">{task.title}</div>
                      <div className="text-lg text-gray-600">
                        Due at {task.dueDate}
                      </div>
                    </div>

                    {task.status === "missed" && (
                      <div className="text-red-600 font-semibold text-lg">
                        Missed
                      </div>
                    )}
                    {task.status === "submitted" && (
                      <div className="text-black font-semibold text-lg">
                        Submitted
                      </div>
                    )}
                    {task.status === "approved" && (
                      <div className="text-green-800 font-semibold text-lg">
                        Approved
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ))}
      </div>

      <Link
        href={`/assignments/new?courseId=${courseId}`}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-4 py-3 shadow
                   bg-gradient-to-r from-[#326295] to-[#0a1c30] text-white text-[16px] font-medium
                   hover:from-[#28517c] hover:to-[#071320] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#326295]
                   active:scale-[0.98] transition"
      >
        <Plus className="h-5 w-5" />
        <span className="hidden sm:inline">Add New Assignments</span>
      </Link>
    </main>
  );
}
