"use client";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { getAllAssignmentsAPI, getAllAssignmentsStfLecAPI } from "@/api/assignment/getAllAssignments";
import type { getAllAssignments } from "@/types/api/assignment";
import { getUserRole } from "@/util/cookies";
import AssignmentModal from "@/components/assignment/AssignmentModal";
import { getStudentAssignmentAPI } from "@/api/assignment/getAssignmentStudent";
import { createAssignmentAPI } from "@/api/assignment/createAssignment";
import EditAssignmentModal from "@/components/assignment/EditAssignmentModal";
import { updateAssignmentAPI } from "@/api/assignment/updateAssignment";
import { getLecStfAssignmentDetailAPI } from "@/api/assignment/assignmentDetail";
import { deleteAssignmentAPI } from "@/api/assignment/deleteAssignment";

export const dynamic = "force-dynamic";

type CardAssignment = {
  id: string;
  title: string;
  dueDate: string;
  status: "missed" | "upcoming" | "submitted" | "approved";
  dateGroup: string;
  sortKey: number;
};

function AssignmentPageContent() {
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
  const [editAssignment, setEditAssignment] = useState<CardAssignment | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAssignmentDetail, setEditAssignmentDetail] = useState<any>(null);
  const [editAssignmentId, setEditAssignmentId] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  console.log("Current user role:", role);
  const [creatingAssignment, setCreatingAssignment] = useState(false);
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

  const handleEditClick = (task: CardAssignment) => {
    setEditAssignmentId(task.id);
    setShowEditModal(true);
    console.log("assignment Id to edit:", task.id);
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
        const dueISO = pickDueISO(ot);
        if (!dueISO) return null;
        const ms = new Date(dueISO).getTime();
        if (Number.isNaN(ms)) return null;

        return {
          id: String(ot.id),
          title: ot.name ?? "(Untitled)",
          dueDate: safeFormatTime(dueISO),
          status: computeOpenStatus(dueISO),
          dateGroup: safeFormatDateGroup(dueISO),
          sortKey: ms,
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

  const lecturerCards: CardAssignment[] = useMemo(() => {
    if (!lecturerData) return [];
    return lecturerData
      .map((a) => {
        const whenISO = a.endDate ?? ""; // ← only use endDate
        if (!whenISO) return null;
        const ms = new Date(whenISO).getTime();
        if (Number.isNaN(ms)) return null;
        return {
          id: a.id,
          title: a.name ?? "(Untitled)",
          dueDate: safeFormatTime(whenISO),
          status: computeOpenStatus(whenISO),
          dateGroup: safeFormatDateGroup(whenISO),
          sortKey: ms,
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
                <div className="text-2xl font-semibold mb-3">End Date : {date}</div>
                {tasks.map((task, idx) => (
                  <div key={`${task.id}--${task.sortKey}-${idx}`} className="relative">
                    <Link href={detailHref(task.id)}>
                      <div className="bg-white border border-gray-300 p-5 rounded-md shadow-sm mb-2 cursor-pointer hover:shadow-md transition">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-xl">{task.title}</div>
                            <div className="text-lg text-gray-600">Due at {task.dueDate}</div>
                          </div>
                        </div>
                      </div>
                    </Link>
                    {isStaff && (<div className="absolute top-4 right-4 flex">
                      <button
                        className="inline-flex items-center justify-center rounded-md border bg-white p-2 text-gray-600 hover:bg-gray-50 mr-2"
                        onClick={() => handleEditClick(task)}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-6" />
                      </button>
                      <button
                        title="Delete"
                        className="inline-flex items-center justify-center rounded-md border bg-white p-2 text-xl text-red-600 hover:bg-red-50"
                        onClick={async () => {
                          if (window.confirm("Are you sure you want to delete this assignment?")) {
                            try {
                              await deleteAssignmentAPI(task.id);
                              window.location.reload();
                            } catch (err) {
                              alert("Failed to delete assignment");
                            }
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>)}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {isStaff && (
            <>
              <button
                onClick={() => setShowCreateModal(true)}
                disabled={creatingAssignment}
                className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-4 py-3 shadow
       bg-gradient-to-r from-[#326295] to-[#0a1c30] text-white text-[16px] font-medium
       hover:from-[#28517c] hover:to-[#071320] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#326295]
       active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-5 w-5" />
                <span className="hidden sm:inline">{creatingAssignment ? "Creating..." : "Add New Assignment"}</span>
              </button>

              {showCreateModal && (
                <AssignmentModal
                  open={showCreateModal}
                  onClose={() => setShowCreateModal(false)}
                  onSubmit={async (data) => {
                    setCreatingAssignment(true);
                    try {
                      const payload = {
                        courseId,
                        name: data.title,
                        description: data.descriptionHtml ?? "",
                        endDate: data.endAt ?? "",
                        schedule: data.scheduleAt ?? null,
                        dueDate: data.dueAt ?? "",
                        deliverables: data.deliverables.map((d) => ({
                          name: d.name,
                          allowedFileTypes: d.requiredTypes.map((typeStr) =>
                            typeStr === "PDF" ? "pdf"
                              : typeStr === "DOCX" ? "docx"
                                : typeStr.toLowerCase()
                          ),
                        })),
                      };
                      const response = await createAssignmentAPI(payload);
                      const result = {
                        id: response.assignment.id,
                        courseId: response.assignment.courseId,
                      };
                      setShowCreateModal(false);
                      window.location.reload();
                      return result;
                    } catch (e) {
                      console.error("Failed to create assignment:", e);
                    } finally {
                      setCreatingAssignment(false);
                    }
                  }}
                />
              )}
            </>
          )}
          {isStaff && showEditModal && editAssignmentId && (
            <EditAssignmentModal
              open={showEditModal}
              assignmentId={editAssignmentId}
              onClose={() => setShowEditModal(false)}
              onSubmit={async (data) => {
                try {
                  const prev = lecturerData.find(a => a.id === data.assignmentId) || {
                    name: "",
                    description: "",
                    endDate: "",
                    dueDate: "",
                    schedule: "",
                    deliverables: [],
                  };

                  const keepValue = (newVal: any, oldVal: any) =>
                    newVal !== undefined && newVal !== null && String(newVal).trim() !== "" ? newVal : oldVal;

                  const keepUrls = data.existingFiles
                    ? data.existingFiles.filter((f: any) => data.keepFileIds.includes(f.id)).map((f: any) => f.filepath)
                    : [];

                  const name = keepValue(data.title ?? data.name, prev.name);
                  let description: string | undefined;
                  if (Object.prototype.hasOwnProperty.call(data, "description")) {
                    description =
                      typeof data.description === "string"
                        ? data.description
                        : String(data.description ?? "");
                  } else {
                    description = prev.description;
                  }
                  const endDate = keepValue(data.endDate, prev.endDate);
                  const dueDate = keepValue(data.dueDate, prev.dueDate);
                  const schedule = keepValue(data.schedule, prev.schedule);
                  const deliverables = Array.isArray(data.deliverables) && data.deliverables.length > 0
                    ? data.deliverables
                    : (prev as any).deliverables ?? [];

                  console.log("Deliverables to send:", deliverables);


                  if (data.files && Array.isArray(data.files) && data.files.length > 0) {
                    for (const file of data.files) {
                      await updateAssignmentAPI(
                        data.assignmentId,
                        name,
                        description,
                        endDate,
                        dueDate,
                        schedule,
                        deliverables,
                        keepUrls,
                        file
                      );
                    }
                  } else {
                    await updateAssignmentAPI(
                      data.assignmentId,
                      name,
                      description,
                      endDate,
                      dueDate,
                      schedule,
                      deliverables,
                      keepUrls,
                      null
                    );
                  }
                  setShowEditModal(false);
                  window.location.reload();
                } catch (err) {
                  alert("Failed to update assignment");
                }
              }}
            />
          )}
        </>
      )}
    </main>
  );
}

export default function AssignmentPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center p-6">Loading assignments...</div>}>
      <AssignmentPageContent />
    </Suspense>
  );
}
