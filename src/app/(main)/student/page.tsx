"use client";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, CheckCircle2 } from "lucide-react";
import { getDashboardData } from "@/api/dashboard/getDashboard";
import { Dashboard } from "@/types/api/dashboard";
import { getGroupInformation } from "@/api/dashboard/getGroupInformation";
import { getGroupData } from "@/api/dashboard/getGroupDashboard";
import { getAllAssignments } from "@/types/api/assignment";
import { getAllAssignmentsAPI } from "@/api/assignment/getAllAssignments";

export function formatUploadAt(
  iso: string,
  locale: string = "en-GB" // change to "th-TH" for Thai
) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso; // fallback if bad input

  return d.toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: "Asia/Bangkok", // convert from Z (UTC) → Bangkok (UTC+7)
  });
}

export default function StudentDashboard() {
  const [dashboard, setDashboard] = useState<Dashboard.Dashboard | null>(null);
  const [groupInfo, setGroupInfo] = useState<Dashboard.studentInfo | null>(null);
  const [groupDashboard, setGroupDashboard] = useState<Dashboard.Dashboard | null>(null);
  const [assignments, setAssignments] = useState<getAllAssignments.allAssignment[]>([]);
    const [selectedAssignmentChartId, setSelectedAssignmentChartId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const courseId = useSearchParams().get("courseId") || "";

  const handleChartAssignmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const assignmentId = Number(e.target.value);
      setSelectedAssignmentChartId(assignmentId > 0 ? assignmentId : null);
  
      if (!isNaN(assignmentId)) {
        fetchDashboardDataWithQuery({ assignmentId: assignmentId > 0 ? assignmentId : undefined });
      }
    }

  const fetchGroupInformation = async () => {
    try {
      if (!courseId) return;

      const id = Number(courseId);
      if (Number.isNaN(id)) {
        setError("Invalid courseId in URL");
        return;
      }
      const response = await getGroupInformation(id);

      setGroupInfo(response.data[0]);
    } catch (error) {
      console.error("Failed to load group information:", error);
      setError("Failed to load group information");
    }
  };

  const fetchDashboardData = async () => {
    try {
      if (!courseId) return;

      const id = Number(courseId);
      if (Number.isNaN(id)) {
        setError("Invalid courseId in URL");
        return;
      }
      const response = await getDashboardData(id);
      setDashboard(response.data);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      setError("Failed to load dashboard data");
    }
  };

  const fetchDashboardDataWithQuery = async (query: { assignmentId?: number; groupId?: number }) => {
      try {
        if (!courseId) return;
        setDashboardLoading(true);
        const id = Number(courseId);
        if (Number.isNaN(id)) {
          setError("Invalid courseId in URL");
          return;
        }
        const response = await getDashboardData(id, query);
        console.log("Response with query:", response.data);
  
        setDashboard(response.data);
      } catch (error) {
        setError("Failed to load dashboard data");
      } finally {
        setDashboardLoading(false);
      }
    }

  const fetchAssignments = async () => {
    try {
      if (!courseId) return;

      const id = Number(courseId);
      if (Number.isNaN(id)) {
        setError("Invalid courseId in URL");
        return;
      }
      const response = await getAllAssignmentsAPI(id);
      console.log("Response:", response.data);
      setAssignments(response.data);
    } catch (error) {
      setError("Failed to load assignments");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchGroupInformation();
      await fetchDashboardData();
      await fetchAssignments();
      await fetchDashboardDataWithQuery({ assignmentId: selectedAssignmentChartId || undefined });
      setLoading(false);
    };

    fetchData();
  }, [courseId]);


  return (
    <main className="min-h-screen bg-white p-6 font-dbheavent">

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 lg:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Class Information</h2>
              </div>
              {dashboard && (
                <>
                  <InfoRow label="Class Name" value={dashboard.course?.name ?? "Unknown"} />
                  <InfoRow label="Description" value={dashboard.course.description || "No description available"} />
                  <InfoRow label="Program Type" value={dashboard.course.program ?? "Unknown"} />
                  <InfoRow label="Created Date" value={formatUploadAt(dashboard.course.createdAt ?? "")} />
                  <InfoRow label="Created By" value={dashboard.course.createdBy.name ?? "Unknown"} />
                </>
              )}
            </section>

            <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Dashboard</h2>
                <div className="flex items-center gap-3">
                  <label className="text-xl text-gray-600">Assignment</label>
                  <select onChange={handleChartAssignmentChange} className="block border border-gray-300 rounded px-2 py-1 text-lg">
                    <option value={-1}>-- Select Assignment --</option>
                    {assignments.map((assignment) => (
                      <option
                        key={assignment.id}
                        value={assignment.id}
                      >
                        {assignment.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="flex items-center justify-center">
                  <Donut percent={100} label="Submissions" total="3 Totals" />
                </div>
                <ul className="space-y-2 text-lg">
                  {dashboard && (
                    <>
                      <LegendItem color="#6b7280" text={`Not Submitted: ${dashboard.submissions?.statusCounts.NOT_SUBMITTED}`} />
                      <LegendItem color="#1d4ed8" text={`Submitted: ${dashboard.submissions?.statusCounts.SUBMITTED}`} />
                      <LegendItem color="#ef4444" text={`Rejected: ${dashboard.submissions?.statusCounts.REJECTED}`} />
                      <LegendItem color="#10b981" text={`Approved with Feedback: ${dashboard.submissions?.statusCounts.APPROVED_WITH_FEEDBACK}`} />
                      <LegendItem color="#16a34a" text={`Final: ${dashboard.submissions?.statusCounts.FINAL}`} />
                    </>
                  )}
                </ul>
              </div>

              {/* <div className="mt-3">
                <Link href="#" className="text-lg text-[#326295] hover:underline">
                  More Detail
                </Link>
              </div> */}
            </section>
          </div>

          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-2xl font-semibold mb-4">Alerts</h2>
            <div className="divide-y">
              <AlertRow
                icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
                title="Assignment Approved"
                desc="Assignment 3 has been marked as final. No further action is required."
                date="01/04/2025, 09:00 AM"
              />
              <AlertRow
                icon={<span className="text-xl">📨</span>}
                title="Announcement Posted"
                desc="New announcement posted by Thanatat Wongabut"
                date="01/04/2025, 09:00 AM"
              />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-2xl font-semibold mb-4">Summary</h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-lg">
              {dashboard ? (
                <>
                  <DT label="Total Students" value={(dashboard.totals.students ?? 0).toString()} />
                  <DT label="Total Advisors" value={(dashboard.totals.advisors ?? 0).toString()} />
                  <DT label="Total Groups" value={(dashboard.totals.groups ?? 0).toString()} />
                  <DT label="Total Assignments" value={(dashboard.totals.assignments ?? 0).toString()} />
                </>
              ) : (
                <>
                  <DT label="Total Students" value="0" />
                  <DT label="Total Advisors" value="0" />
                  <DT label="Total Groups" value="0" />
                  <DT label="Total Assignments" value="0" />
                </>
              )}
            </dl>
          </section>
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
            <ul className="space-y-2 text-[#326295]">
              <li>
                <Link href="/assignments/1" className="inline-flex items-center gap-2 hover:underline text-lg">
                  Assignment 1
                </Link>
              </li>
              <li>
                <Link href="/assignments/2" className="inline-flex items-center gap-2 hover:underline text-lg">
                  Assignment 2
                </Link>
              </li>
              <li>
                <Link href="/assignments/3" className="inline-flex items-center gap-2 hover:underline text-lg">
                  Assignment 3
                </Link>
              </li>
            </ul>
          </section>

          <GroupInformationCard
            data={{
              id: groupInfo?.id?.toString() || "No Group",
              projectTitle: groupInfo?.projectName || "-",
              productTitle: groupInfo?.productName || "-",
              company: groupInfo?.company || "-",
              members: groupInfo?.members?.map(member =>
                `${member.courseMember.user.id} ${member.courseMember.user.name} (${member.workRole})`
              ) || [],
              advisor: groupInfo?.advisors?.[0]?.courseMember?.user?.name || "No Advisor Assigned",
            }}
            onEdit={() => console.log("Edit group")}
          />
        </div>
      </div>
    </main>
  );
}

function GroupInformationCard({
  data,
  onEdit,
}: {
  data: {
    id: string;
    projectTitle: string;
    productTitle: string;
    company?: string;
    members: string[];
    advisor: string;
  };
  onEdit?: () => void;
}) {
  return (
    <section className="bg-white rounded-[20px] border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-900">Group Information</h2>
        <button
          onClick={onEdit}
          className="p-2 rounded-md hover:bg-gray-100"
          aria-label="Edit group"
        >
          <Pencil className="h-5 w-5 text-gray-700" />
        </button>
      </div>

      <div className="space-y-4 text-gray-900">
        <Field label="ID" value={data.id} />
        <Field label="Project Title" value={data.projectTitle} />
        <Field label="Product Title" value={data.productTitle} />
        {data.company && <Field label="Company" value={data.company} />}

        <Field label="Member">
          <ul className="space-y-1 text-lg">
            {data.members.length > 0 ? (
              data.members.map((m, i) => (
                <li key={i}>{m}</li>
              ))
            ) : (
              <li className="text-gray-500">No members assigned</li>
            )}
          </ul>
        </Field>

        <Field label="Advisor" value={data.advisor} />
      </div>
    </section>
  );
}

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
          <div className="text-lg text-gray-600">{desc}</div>
          <Link href="#" className="text-lg text-[#326295] hover:underline">
            More Detail
          </Link>
        </div>
      </div>
      <div className="text-lg text-gray-500">{date}</div>
    </div>
  );
}