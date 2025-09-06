"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Pencil, AlertTriangle, FilePlus2, Megaphone, Upload } from "lucide-react";
import { getDashboardData } from "@/api/dashboard/getDashboard";
import type { Dashboard } from "@/types/api/dashboard";
import { getAllAssignments } from "@/types/api/assignment";
import { getAllAssignmentsAPI } from "@/api/assignment/getAllAssignments";
import { getGroupInformation } from "@/api/dashboard/getGroupInformation";
import { getAllGroupAPI } from "@/api/group/getAllGroup";
import { getGroup } from "@/types/api/group";

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

export default function CourseTab() {
  const searchParams = useSearchParams();

  const [dashboard, setDashboard] = useState<Dashboard.Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [group, setGroup] = useState<getGroup.GroupList>([]);
  const [groupInfo, setGroupInfo] = useState<Dashboard.studentInfo[]>([]);
  const [assignments, setAssignments] = useState<getAllAssignments.allAssignment[]>([]);
  const [selectedGroupChart, setSelectedGroupChart] = useState<Dashboard.studentInfo | null>(null);
  const [selectedAssignmentChartId, setSelectedAssignmentChartId] = useState<number | null>(null);
  const courseId = searchParams.get("courseId") || "";

  const handleChartGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const groupId = Number(e.target.value);
    if (groupId === -1) {
      // "All Groups" selected
      setSelectedGroupChart(null);
      fetchDashboardDataWithQuery({
        groupId: undefined, // Don't filter by group, show all groups
        assignmentId: selectedAssignmentChartId || undefined
      });
    } else {
      // Specific group selected
      const group = groupInfo.find(g => g.id === groupId) || null;
      setSelectedGroupChart(group);
      fetchDashboardDataWithQuery({
        groupId: group ? group.id : undefined,
        assignmentId: selectedAssignmentChartId || undefined
      });
    }
  };


  const handleChartAssignmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const assignmentId = Number(e.target.value);
    setSelectedAssignmentChartId(assignmentId > 0 ? assignmentId : null);

    if (!isNaN(assignmentId)) {
      fetchDashboardDataWithQuery({ assignmentId: assignmentId > 0 ? assignmentId : undefined, groupId: selectedGroupChart?.id || undefined });
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

      setGroupInfo(response.data);
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

      // console.log("Response:", response.data);
      setDashboard(response.data);
    } catch (error) {
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

  const fetchAllGroup = async () => {
    try {
      if (!courseId) return;

      const id = Number(courseId);
      if (Number.isNaN(id)) {
        setError("Invalid courseId in URL");
        return;
      }
      const response = await getAllGroupAPI(id);
      // console.log("Response:", response.data);
      setGroup(response.data);
    } catch (error) { }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchGroupInformation();
      await fetchDashboardData();
      await fetchAssignments();
      await fetchAllGroup();
      await fetchDashboardDataWithQuery({ groupId: selectedGroupChart ? selectedGroupChart.id ?? undefined : undefined, assignmentId: selectedAssignmentChartId || undefined });

      setLoading(false);
    }
    fetchData();
  }, [courseId]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Class Information</h2>
              <button className="p-2 rounded-md hover:bg-gray-100">
                <Pencil className="w-4 h-4 text-gray-700" />
              </button>
            </div>
            {dashboard && (
              <>
                <InfoRow label="Class Name" value={dashboard.course?.name ?? "Unknown"} />
                <InfoRow label="Description" value={dashboard?.course.description ?? "No description available"} />
                <InfoRow label="Program Type" value={dashboard?.course.program ?? "Unknown"} />
                <InfoRow label="Created Date" value={formatUploadAt(dashboard?.course.createdAt ?? "")} />
                <InfoRow label="Created By" value={dashboard?.course.createdBy.name ?? "Unknown"} />
              </>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 lg:col-span-2">
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
              <div className="flex items-center gap-3">
                <label className="text-xl text-gray-600">Group</label>
                <select
                  onChange={handleChartGroupChange}
                  className="block border border-gray-300 rounded px-2 py-1 text-lg"
                  value={selectedGroupChart?.id || -1}
                >
                  <option value={-1}>-- Select Group --</option>
                  {group.map((group) => (
                    <option
                      key={group.id}
                      value={group.id}
                    >
                      {group.projectName}
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
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-2xl font-semibold mb-4">Alerts</h2>
          <div className="divide-y">
            <AlertRow
              icon={<AlertTriangle className="w-6 h-6 text-yellow-600" />}
              title="Assignment Missed"
              desc="5 groups missed the submission for Assignment 1"
              date="01/04/2025, 09:00 AM"
            />
            <AlertRow
              icon={<span className="text-2xl">📣</span>}
              title="Announcement Posted"
              desc="New announcement posted by Thanatat Wongabut"
              date="01/04/2025, 09:00 AM"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-2xl font-semibold mb-4">Summary</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-lg">
            <DT label="Total Students" value={dashboard?.totals.students ?? 0} />
            <DT label="Total Advisors" value={dashboard?.totals.advisors ?? 0} />
            <DT label="Total Groups" value={dashboard?.totals.groups ?? 0} />
            <DT label="Total Assignments" value={dashboard?.totals.assignments ?? 0} />
          </dl>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
          <ul className="space-y-2 text-[#326295] text-lg">
            <li>
              <Link href={`/assignments/new?courseId=${courseId}`} className="hover:underline inline-flex items-center gap-2">
                <FilePlus2 className="w-5 h-5" /> Create Assignment
              </Link>
            </li>
            <li>
              <Link href={`/announcements/new?courseId=${courseId}`} className="hover:underline inline-flex items-center gap-2">
                <Megaphone className="w-5 h-5" /> Create Announcement
              </Link>
            </li>
            <li>
              <Link href={`/files/?courseId=${courseId}`} className="hover:underline inline-flex items-center gap-2">
                <Upload className="w-5 h-5" /> Upload File
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* --- small presentational helpers --- */

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="py-2">
      <div className="text-lg font-bold text-gray-900">{label}</div>
      <div className="text-lg text-gray-900">{value}</div>
    </div>
  );
}

function DT({ label, value }: { label: string; value: number }) {
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

function MultiColorDonut({
  segments,
  total
}: {
  segments: Array<{
    key: string;
    color: string;
    label: string;
    count: number;
    percentage: number;
    startAngle: number;
    endAngle: number;
  }>;
  total: number;
}) {
  if (total === 0) {
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-48 h-48 rounded-full bg-gray-200">
          <div className="absolute inset-4 bg-white rounded-full grid place-items-center">
            <div className="text-center">
              <div className="text-3xl font-bold">0</div>
              <div className="text-lg text-gray-500">No Data</div>
            </div>
          </div>
        </div>
        <div className="mt-2 text-lg text-gray-600">0 Total Submissions</div>
      </div>
    );
  }

  // Create the conic-gradient string
  const gradientSegments = segments.map(segment =>
    `${segment.color} ${segment.startAngle}deg ${segment.endAngle}deg`
  ).join(', ');

  // Calculate the largest segment for display
  const largestSegment = segments.reduce((max, segment) =>
    segment.percentage > max.percentage ? segment : max
  );

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative w-48 h-48 rounded-full"
        style={{
          background: `conic-gradient(${gradientSegments})`,
          transform: 'rotate(-90deg)' // Start from top instead of right
        }}
      >
        <div className="absolute inset-4 bg-white rounded-full grid place-items-center" style={{ transform: 'rotate(90deg)' }}>
          <div className="text-center">
            <div className="text-xl text-gray-900">Submissions</div>
            <div className="text-2xl font-bold">{total} Totals</div>
          </div>
        </div>
      </div>
    </div>
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
