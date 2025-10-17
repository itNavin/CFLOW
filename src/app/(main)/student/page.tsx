"use client";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, CheckCircle2 } from "lucide-react";
import { getDashboardData } from "@/api/dashboard/getDashboard";
import { Dashboard } from "@/types/api/dashboard";
import { getGroupInformation } from "@/api/dashboard/getGroupInformation";
import { getGroupData } from "@/api/dashboard/getGroupDashboard";
import { getAllAssignments } from "@/types/api/assignment";
import { getAllAssignmentsAPI } from "@/api/assignment/getAllAssignments";
import CourseInfo from "@/components/dashboard/courseInfo";

export const dynamic = "force-dynamic";

function formatUploadAt(
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
    timeZone: "Asia/Bangkok",
  });
}

function StudentDashboardContent() {
  const [dashboard, setDashboard] = useState<Dashboard.Dashboard | null>(null);
  const [groupInfo, setGroupInfo] = useState<Dashboard.studentInfo | null>(null);
  const [groupDashboard, setGroupDashboard] = useState<Dashboard.Dashboard | null>(null);
  const [assignments, setAssignments] = useState<getAllAssignments.allAssignment[]>([]);
  const [selectedAssignmentChartId, setSelectedAssignmentChartId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const courseId = useSearchParams().get("courseId") || "";

  const handleChartAssignmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const assignmentId = e.target.value;
    setSelectedAssignmentChartId(assignmentId > "0" ? assignmentId : null);

    if (!assignmentId) {
      fetchDashboardDataWithQuery({
        assignmentId: assignmentId > "0" ? assignmentId : undefined,
        groupId: groupInfo?.groupInformation[0].id
      });
    }
  };

  const fetchGroupInformation = async () => {
    try {
      if (!courseId) {
        setError("Invalid courseId in URL");
        return;
      }
      const response = await getGroupInformation(courseId);
      console.log("Group information:", response.data);

      setGroupInfo(response.data);
    } catch (error) {
      console.error("Failed to load group information:", error);
      setError("Failed to load group information");
    }
  };

  const fetchDashboardDataWithQuery = async (query: { assignmentId?: string; groupId?: string }) => {
    try {
      if (!courseId) return;
      setDashboardLoading(true);
      const id = courseId;
      if (!id) {
        setError("Invalid courseId in URL");
        return;
      }
      const response = await getDashboardData(courseId, {
        assignmentId: query.assignmentId !== undefined ? String(query.assignmentId) : undefined,
        groupId: query.groupId !== undefined ? String(query.groupId) : undefined,
      });
      console.log("Dashboard response with query:", response.data);

      setDashboard(response.data);
    } catch (error) {
      console.error("Failed to load dashboard data with query:", error);
      setError("Failed to load dashboard data");
    } finally {
      setDashboardLoading(false);
    }
  }

  const fetchAssignments = async () => {
    try {
      if (!courseId) return;

      if (!courseId) {
        setError("Invalid courseId in URL");
        return;
      }
      const response = await getAllAssignmentsAPI(courseId);
      console.log("Assignments:", response.data);
      setAssignments(response.data.assignments);
    } catch (error) {
      console.error("Failed to load assignments:", error);
      setError("Failed to load assignments");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchGroupInformation();
      await fetchAssignments();
      setLoading(false);
    };

    fetchData();
  }, [courseId]);

  useEffect(() => {
    if (
      !groupInfo ||
      !Array.isArray(groupInfo.groupInformation) ||
      groupInfo.groupInformation.length === 0
    ) return;
    fetchDashboardDataWithQuery({ groupId: groupInfo.groupInformation[0].id });
  }, [groupInfo]);

  useEffect(() => {
    if (
      !groupInfo ||
      !Array.isArray(groupInfo.groupInformation) ||
      groupInfo.groupInformation.length === 0
    ) return;
    fetchDashboardDataWithQuery({
      assignmentId: selectedAssignmentChartId || undefined,
      groupId: String(groupInfo.groupInformation[0].id)
    });
  }, [groupInfo, selectedAssignmentChartId]);

  const getStatusCounts = () => {
    if (!dashboard?.course?.submissions?.statusCounts) {
      return undefined;
    }
    return dashboard.course.submissions.statusCounts;
  };

  type StatusKey = 'NOT_SUBMITTED' | 'SUBMITTED' | 'REJECTED' | 'APPROVED_WITH_FEEDBACK' | 'FINAL';
  const getStatusCount = (status: StatusKey): number => {
    return dashboard?.course?.submissions?.statusCounts?.[status] || 0;
  };

  return (
    <main className="min-h-screen bg-white p-6 font-dbheavent">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 lg:col-span-1">
              <CourseInfo courseId={courseId} />
            </section>

            <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 lg:col-span-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <h2 className="text-2xl font-semibold">Dashboard</h2>
                <div className="flex items-center gap-2">
                  <label className="text-lg text-gray-600 whitespace-nowrap">Assignment:</label>
                  <select
                    onChange={handleChartAssignmentChange}
                    value={selectedAssignmentChartId || -1}
                    className="border border-gray-300 rounded px-2 py-1 text-base min-w-[160px]"
                  >
                    <option value={-1}>All Assignments</option>
                    {assignments.map((assignment) => (
                      <option key={assignment.id} value={assignment.id}>
                        {assignment.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="flex items-center justify-center">
                  <MultiColorDonut
                    statusCounts={getStatusCounts()}
                    loading={dashboardLoading}
                  />
                </div>
                <ul className="space-y-2 text-lg">
                  <LegendItem color="#6b7280" text={`Not Submitted: ${getStatusCount('NOT_SUBMITTED')}`} />
                  <LegendItem color="#1d4ed8" text={`Submitted: ${getStatusCount('SUBMITTED')}`} />
                  <LegendItem color="#ef4444" text={`Rejected: ${getStatusCount('REJECTED')}`} />
                  <LegendItem color="#10b981" text={`Approved with Feedback: ${getStatusCount('APPROVED_WITH_FEEDBACK')}`} />
                  <LegendItem color="#16a34a" text={`Final: ${getStatusCount('FINAL')}`} />
                </ul>
              </div>
            </section>
          </div>
        </div>
        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
            <ul className="space-y-2 text-[#326295]">
              <li>
                <Link
                  href={`/assignments?courseId=${courseId}&groupId=${(groupInfo?.groupInformation && groupInfo.groupInformation.length > 0) ? groupInfo.groupInformation[0].id : ''}`}
                >
                  View All Assignments
                </Link>
              </li>
              <li>
                <Link href={`/files?courseId=${courseId}`} className="inline-flex items-center gap-2 hover:underline text-lg">
                  Course Files
                </Link>
              </li>
              <li>
                <Link href={`/announcements?courseId=${courseId}`} className="inline-flex items-center gap-2 hover:underline text-lg">
                  Announcements
                </Link>
              </li>
            </ul>
          </section>

          <GroupInformationCard
            data={{
              id:
                groupInfo?.groupInformation &&
                  groupInfo.groupInformation.length > 0 &&
                  groupInfo.groupInformation[0].codeNumber
                  ? groupInfo.groupInformation[0].codeNumber
                  : "No Group",
              projectTitle:
                groupInfo?.groupInformation &&
                  groupInfo.groupInformation.length > 0 &&
                  groupInfo.groupInformation[0].projectName
                  ? groupInfo.groupInformation[0].projectName
                  : "-",
              productTitle:
                groupInfo?.groupInformation &&
                  groupInfo.groupInformation.length > 0 &&
                  groupInfo.groupInformation[0].productName
                  ? groupInfo.groupInformation[0].productName
                  : "-",
              company:
                groupInfo?.groupInformation &&
                  groupInfo.groupInformation.length > 0 &&
                  groupInfo.groupInformation[0].company
                  ? groupInfo.groupInformation[0].company
                  : "-",
              members:
                groupInfo?.groupInformation &&
                  groupInfo.groupInformation.length > 0 &&
                  groupInfo.groupInformation[0].members
                  ? groupInfo.groupInformation[0].members.map(member =>
                    `${member.courseMember.user.id} ${member.courseMember.user.name}`
                  )
                  : [],
              advisor:
                groupInfo?.groupInformation &&
                  groupInfo.groupInformation.length > 0 &&
                  groupInfo.groupInformation[0].advisors &&
                  groupInfo.groupInformation[0].advisors[0]?.courseMember?.user?.name
                  ? groupInfo.groupInformation[0].advisors[0].courseMember.user.name
                  : "No Advisor Assigned",
              codeNumber:
                groupInfo?.groupInformation &&
                  groupInfo.groupInformation.length > 0 &&
                  groupInfo.groupInformation[0].codeNumber
                  ? groupInfo.groupInformation[0].codeNumber
                  : "-",
            }}
            onEdit={() => console.log("Edit group")}
          />
        </div>
      </div>
    </main>
  );
}

function MultiColorDonut({
  statusCounts,
  loading = false
}: {
  statusCounts?: {
    NOT_SUBMITTED?: number;
    SUBMITTED?: number;
    REJECTED?: number;
    APPROVED_WITH_FEEDBACK?: number;
    FINAL?: number;
  };
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-48 h-48 rounded-full bg-gray-200 animate-pulse">
          <div className="absolute inset-4 bg-white rounded-full grid place-items-center">
            <div className="text-center">
              <div className="text-xl text-gray-400">Loading...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default values if no data
  const counts = {
    NOT_SUBMITTED: statusCounts?.NOT_SUBMITTED || 0,
    SUBMITTED: statusCounts?.SUBMITTED || 0,
    REJECTED: statusCounts?.REJECTED || 0,
    APPROVED_WITH_FEEDBACK: statusCounts?.APPROVED_WITH_FEEDBACK || 0,
    FINAL: statusCounts?.FINAL || 0,
  };

  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

  // Handle no data case
  if (total === 0) {
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-48 h-48 rounded-full bg-gray-200">
          <div className="absolute inset-4 bg-white rounded-full grid place-items-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-400">0</div>
              <div className="text-lg text-gray-500">No Data</div>
            </div>
          </div>
        </div>
        <div className="mt-2 text-lg text-gray-600">0 Total Submissions</div>
      </div>
    );
  }

  const statusColors = {
    NOT_SUBMITTED: '#6b7280', // gray
    SUBMITTED: '#1d4ed8',      // blue
    REJECTED: '#ef4444',       // red
    APPROVED_WITH_FEEDBACK: '#10b981', // green
    FINAL: '#16a34a',          // dark green
  };

  // Calculate segments
  let currentAngle = 0;
  const segments = Object.entries(counts)
    .filter(([, count]) => count > 0) // Only include statuses with counts > 0
    .map(([status, count]) => {
      const percentage = (count / total) * 100;
      const degrees = (count / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + degrees;

      currentAngle = endAngle;

      return {
        status,
        count,
        percentage,
        startAngle,
        endAngle,
        color: statusColors[status as keyof typeof statusColors],
      };
    });

  // Create the conic-gradient string
	const gradientSegments = segments.map(segment =>
    `${segment.color} ${segment.startAngle}deg ${segment.endAngle}deg`
  ).join(', ');

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative w-48 h-48 rounded-full"
        style={{
          background: segments.length > 0
            ? `conic-gradient(${gradientSegments})`
            : '#e5e7eb',
          transform: 'rotate(-90deg)' // Start from top instead of right
        }}
      >
        <div className="absolute inset-4 bg-white rounded-full grid place-items-center" style={{ transform: 'rotate(90deg)' }}>
          <div className="text-center">
            <div className="text-xl text-gray-900">Submissions</div>
            <div className="text-2xl font-bold">{total} Total{total !== 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>
    </div>
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
    codeNumber: string;
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
          {/* <Pencil className="h-5 w-5 text-gray-700" /> */}
        </button>
      </div>

      <div className="space-y-4 text-gray-900">
        <Field label="ID" value={data.codeNumber} />
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

function LegendItem({ color, text }: { color: string; text: string }) {
  return (
    <li className="flex items-center gap-2">
      <span className="inline-block w-4 h-4 rounded-sm" style={{ backgroundColor: color }} />
      <span className="text-lg font-bold">{text}</span>
    </li>
  );
}

export default function StudentDashboard() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center p-6">Loading student dashboard...</div>}>
      <StudentDashboardContent />
    </Suspense>
  );
}
