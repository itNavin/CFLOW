"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { getAllAssignmentsAPI, getAllAssignmentsStfLecAPI } from "@/api/assignment/getAllAssignments";
import type { getAllAssignments } from "@/types/api/assignment";
import { getUserRole } from "@/util/cookies";
import AssignmentModal from "@/components/assignmentModal";
import { getStudentAssignmentAPI } from "@/api/assignment/getAssignmentStudent";

type CardAssignment = {
  id: string;
  title: string;
  dueDate: string;
  status: "missed" | "upcoming" | "submitted" | "approved";
  dateGroup: string;
  sortKey: number;
};

export default function AssignmentPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const sp = useSearchParams();
  const [courseId, setCourseId] = useState("");
  const [groupId, setGroupId] = useState("");
  useEffect(() => {
    if (!sp) return;
    setCourseId(sp.get("courseId") || "");
    setGroupId(sp.get("groupId") || "");
  }, [sp]);

  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    setRole(getUserRole());
  }, []);

  const isStudent = role === "student";
  const isStaff = role === "staff" || role === "SUPER_ADMIN";
  const isAdvisor = role === "advisor";

  const [activeTab, setActiveTab] = useState<"open" | "submitted">("open");
  const [studentAssignment, setStudentAssignment] = useState<getAllAssignments.studentAssignment | null>(null);
  const [lecturerData, setLecturerData] = useState<getAllAssignments.stfAssignment[]>([]);
  const [loading, setLoading] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingAssignment] = useState(false);

  const safeDate = (iso: string) =>
    mounted ? new Date(iso) : null;

  const safeFormatDateGroup = (iso: string) => {
    const d = safeDate(iso);
    if (!d) return "—";
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "Asia/Bangkok" });
  };

  const safeFormatTime = (iso: string) => {
    const d = safeDate(iso);
    if (!d) return "—";
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Bangkok" });
  };

  const computeOpenStatus = (dueISO: string | null): "missed" | "upcoming" => {
    if (!mounted || !dueISO) return "upcoming"; // before mount, keep stable
    return new Date(dueISO).getTime() < Date.now() ? "missed" : "upcoming";
  };

  useEffect(() => {
    if (!mounted || !courseId) return;
    const run = async () => {
      try {
        if (isStudent) {
          const res = await getStudentAssignmentAPI(courseId);
          const a = res?.data?.assignment;
          if (a && typeof a === "object") {
            setStudentAssignment(a as getAllAssignments.studentAssignment);
          } else {
            setStudentAssignment(null);
          }
        } else if (role) {
          setLoading(true);
          const res = await getAllAssignmentsStfLecAPI(courseId);
          setLecturerData(res.data.assignments);
        }
        setActiveTab("open");
      } catch (e) {
        console.error("Failed to fetch assignments", e);
        if (isStudent) setStudentAssignment(null);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [mounted, courseId, isStudent, role]);

  const pickDueISO = (obj: { dueDate?: string | null; endDate?: string | null }) =>
    obj.dueDate ?? obj.endDate ?? "";

  const openCards: CardAssignment[] = useMemo(() => {
    if (!studentAssignment?.openTasks) return [];
    return studentAssignment.openTasks
      .map((ot) => {
        const dueISO = pickDueISO(ot);         // ← dueDate first, else endDate
        if (!dueISO) return null;
        const ms = new Date(dueISO).getTime();
        if (Number.isNaN(ms)) return null;

        return {
          id: String(ot.id),
          title: ot.name ?? "(Untitled)",
          dueDate: safeFormatTime(dueISO),      // display from dueISO
          status: computeOpenStatus(dueISO),    // status from dueISO
          dateGroup: safeFormatDateGroup(dueISO), // group from dueISO
          sortKey: ms,                          // sort by dueISO
        };
      })
      .filter(Boolean) as CardAssignment[];
  }, [studentAssignment, mounted]);

  // SUBMITTED (students)
  const submittedCards: CardAssignment[] = useMemo(() => {
    if (!studentAssignment?.submitted) return [];
    return studentAssignment.submitted
      .map((a) => {
        const dueISO = pickDueISO(a);
        if (!dueISO) return null;
        const ms = new Date(dueISO).getTime();
        if (Number.isNaN(ms)) return null;

        return {
          id: String(a.id ?? ""),
          title: a.name ?? "(Untitled)",
          dueDate: safeFormatTime(dueISO),
          status: "submitted",
          dateGroup: safeFormatDateGroup(dueISO),
          sortKey: ms,
        };
      })
      .filter(Boolean) as CardAssignment[];
  }, [studentAssignment, mounted]);

  // lecturerCards
  const lecturerCards: CardAssignment[] = useMemo(() => {
    if (!lecturerData) return [];
    return lecturerData
      .map((a) => {
        const whenISO = a.dueDate ?? a.endDate ?? a.schedule ?? "";
        if (!whenISO) return null;
        const ms = new Date(whenISO).getTime();            // ← define ms
        if (Number.isNaN(ms)) return null;
        return {
          id: a.id,
          title: a.name ?? "(Untitled)",
          dueDate: safeFormatTime(whenISO),
          status: computeOpenStatus(whenISO),
          dateGroup: safeFormatDateGroup(whenISO),
          sortKey: ms,                                      // ← use it
        };
      })
      .filter(Boolean) as CardAssignment[];
  }, [lecturerData, mounted]);


  const groupedAssignments = (data: CardAssignment[]) =>
    data.reduce<Record<string, CardAssignment[]>>((acc, curr) => {
      (acc[curr.dateGroup] ||= []).push(curr);
      return acc;
    }, {});

  const displayedData = isStudent
    ? activeTab === "open"
      ? openCards
      : submittedCards
    : lecturerCards;

  const sorted = useMemo(
    () => [...displayedData].sort((a, b) => a.sortKey - b.sortKey),
    [displayedData]
  );

  const grouped = useMemo(() => groupedAssignments(sorted), [sorted]);

  const detailHref = (assignmentId: string) =>
    isStudent
      ? { pathname: "/assignments/detail", query: { courseId, assignmentId, groupId } }
      : { pathname: "/assignments/detail", query: { courseId, assignmentId } };

  const openCount = isStudent ? (studentAssignment as any)?.counts?.open ?? 0 : lecturerData?.length ?? 0;
  const submittedCount = isStudent ? (studentAssignment as any)?.counts?.submitted ?? 0 : 0;


  const showSubmittedTab = mounted && isStudent;

  return (
    <main className="min-h-screen bg-white p-6 font-dbheavent">
      {isStudent ? (
        <>
          <div className="flex gap-6 border-b text-2xl font-semibold mb-6">
            <button
              className={`pb-2 ${activeTab === "open" && mounted ? "border-b-2 border-black text-black" : "text-gray-500"}`}
              onClick={mounted ? () => setActiveTab("open") : undefined}
            >
              Open Tasks ({mounted ? openCount : 0})
            </button>

            <button
              className={`pb-2 ${showSubmittedTab && activeTab === "submitted" ? "border-b-2 border-black text-black" : "text-gray-500"} ${showSubmittedTab ? "" : "invisible"}`}
              onClick={showSubmittedTab ? () => setActiveTab("submitted") : undefined}
              aria-hidden={!showSubmittedTab}
              tabIndex={showSubmittedTab ? 0 : -1}
            >
              Submitted ({mounted ? submittedCount : 0})
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
                {tasks.map((task, idx) => (
                  <Link href={detailHref(task.id)} key={`${task.id}-${task}-${idx}`}>
                    <div
                      className={`${task.status === "upcoming"
                        ? "bg-orange-100 border border-orange-200"
                        : task.status === "submitted" || task.status === "approved"
                          ? "bg-green-100 border-green-300"
                          : "bg-white border border-gray-300"
                        } p-5 rounded-md shadow-sm mb-2 cursor-pointer hover:shadow-md transition`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-xl">{task.title}</div>
                          <div className="text-lg text-gray-600">Due at {task.dueDate}</div>
                        </div>
                        {task.status === "missed" && (
                          <div className="text-red-600 font-semibold text-lg">Missed</div>
                        )}
                        {task.status === "submitted" && (
                          <div className="text-black font-semibold text-lg">Submitted</div>
                        )}
                        {task.status === "approved" && (
                          <div className="text-green-800 font-semibold text-lg">Approved</div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {loading && <div className="text-gray-500">Loading assignments…</div>}

          {!loading && lecturerCards.length === 0 && (
            <div className="text-gray-500">No assignments found.</div>
          )}
          <div className="space-y-6">
            {Object.entries(grouped).map(([date, tasks]) => (
              <div key={date}>
                <div className="text-2xl font-semibold mb-3">{date}</div>
                {tasks.map((task, idx) => (
                  <Link href={detailHref(task.id)} key={`${task.id}--${task.sortKey}-${idx}`}>
                    <div className="bg-white border border-gray-300 p-5 rounded-md shadow-sm mb-2 cursor-pointer hover:shadow-md transition">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-xl">{task.title}</div>
                          <div className="text-lg text-gray-600">Due at {task.dueDate}</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ))}
          </div>

          <button
            onClick={mounted && isStaff ? () => setShowCreateModal(true) : undefined}
            disabled={!mounted || !isStaff || creatingAssignment}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-4 py-3 shadow
                       bg-gradient-to-r from-[#326295] to-[#0a1c30] text-white text-[16px] font-medium
                       hover:from-[#28517c] hover:to-[#071320] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#326295]
                       active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">{creatingAssignment ? "Creating..." : "Add New Assignment"}</span>
          </button>
        </>
      )}

      {/* If you wire the modal later, render it conditionally */}
      {/* {showCreateModal && (
        <AssignmentModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={...}
        />
      )} */}
    </main>
  );
}