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
import CourseInfo from "@/components/dashboard/courseInfo";
import CourseTotal from "@/components/dashboard/courseTotal";
import { Course } from "@/types/api/course";

export function formatUploadAt(
  iso: string,
  locale: string = "en-GB"
) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;

  return d.toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: "Asia/Bangkok",
  });
}

export default function CourseTab() {
  const searchParams = useSearchParams();

  const [dashboard, setDashboard] = useState<Dashboard.Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [group, setGroup] = useState<getGroup.GroupList>([]);
  const [assignments, setAssignments] = useState<getAllAssignments.allAssignment[]>([]);

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedAssignmentChartId, setSelectedAssignmentChartId] = useState<string | null>(null);
  const courseId = searchParams.get("courseId") || "";
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChartGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const groupId = e.target.value;
    if (groupId === "-1") {
      setSelectedGroupId(null);
      fetchDashboardDataWithQuery({
        groupId: undefined,
        assignmentId: selectedAssignmentChartId || undefined
      });
    } else {
      const groupExists = group.find(groupItem => groupItem.id === groupId);

      if (groupExists) {
        setSelectedGroupId(groupId);
        fetchDashboardDataWithQuery({
          groupId: groupId,
          assignmentId: selectedAssignmentChartId || undefined
        });
      } else {
        console.error("Selected group not found in groups list:", groupId);
        setError(`Selected group not found: ${groupId}`);
        setSelectedGroupId(null);
      }
    }
  };

  const handleChartAssignmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const assignmentId = e.target.value;
    if (assignmentId === "-1") {
      setSelectedAssignmentChartId(null);
      fetchDashboardDataWithQuery({
        assignmentId: undefined,
        groupId: selectedGroupId || undefined
      });
    } else {
      const assignmentExists = assignments.find(assignment => assignment.id === assignmentId);

      if (assignmentExists) {
        setSelectedAssignmentChartId(assignmentId);
        fetchDashboardDataWithQuery({
          assignmentId: assignmentId,
          groupId: selectedGroupId || undefined
        });
      } else {
        console.error("Selected assignment not found in assignments list:", assignmentId);
        setError(`Selected assignment not found: ${assignmentId}`);
        setSelectedAssignmentChartId(null);
      }
    }
  };

  const fetchDashboardData = async () => {
    try {
      if (!courseId) return;
      const response = await getDashboardData(courseId);
      setDashboard(response.data);
    } catch (error) {
      setError("Failed to load dashboard data");
    }
  };

  const fetchDashboardDataWithQuery = async (query: { assignmentId?: string; groupId?: string }) => {
    try {
      if (!courseId) return;
      setDashboardLoading(true);
      const response = await getDashboardData(courseId, query);
      setDashboard(response.data);
    } catch (error) {
      console.error("Failed to load dashboard data with query:", error);
      setError("Failed to load dashboard data");
    } finally {
      setDashboardLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      if (!courseId) return;
      const response = await getAllAssignmentsAPI(courseId);
      if (response.data?.assignments && Array.isArray(response.data.assignments)) {
        setAssignments(response.data.assignments);
      } else if (Array.isArray(response.data)) {
        setAssignments(response.data);
      } else {
        console.warn("Assignments data is not in expected format:", response.data);
        setAssignments([]);
      }
    } catch (error: any) {
      console.error("Failed to load assignments:", error);
      setError("Failed to load assignments");
      setAssignments([]); 
    }
  };

  const fetchAllGroup = async () => {
    try {
      if (!courseId) return;

      const response = await getAllGroupAPI(courseId);
      setGroup(response.data.groups);
    } catch (error) {
      console.error("Failed to load groups:", error);
      setError("Failed to load groups");
    }
  };

  const handleCourseUpdated = async () => {
    console.log("Course was updated, refreshing dashboard data...");
    await fetchDashboardData();
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchDashboardData();
      await fetchAssignments();
      await fetchAllGroup();
      setLoading(false);
    };
    fetchData();
  }, [courseId]);

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
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 lg:col-span-1">
            <CourseInfo 
            courseId={courseId} 
            onCourseUpdated={handleCourseUpdated}
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 lg:col-span-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <h2 className="text-2xl font-semibold">Dashboard</h2>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-lg text-gray-600 whitespace-nowrap">Assignment:</label>
                  <select
                    onChange={handleChartAssignmentChange}
                    value={selectedAssignmentChartId || -1}
                    className="border border-gray-300 rounded px-2 py-1 text-base min-w-[180px]"
                  >
                    <option value={-1}>All Assignments</option>
                    {assignments.map((assignment) => (
                      <option key={assignment.id} value={assignment.id}>
                        {assignment.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-lg text-gray-600 whitespace-nowrap">Group:</label>
                  <select
                    onChange={handleChartGroupChange}
                    value={selectedGroupId || -1}
                    className="border border-gray-300 rounded px-2 py-1 text-base min-w-[180px]"
                  >
                    <option value={-1}>All Groups</option>
                    {group.map((groupItem) => (
                      <option key={groupItem.id} value={groupItem.id}>
                        {groupItem.projectName || `Group ${groupItem.id}`}
                      </option>
                    ))}
                  </select>
                </div>
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
                {dashboard && (
                  <>
                    <LegendItem color="#6b7280" text={`Not Submitted: ${getStatusCount('NOT_SUBMITTED')}`} />
                    <LegendItem color="#1d4ed8" text={`Submitted: ${getStatusCount('SUBMITTED')}`} />
                    <LegendItem color="#ef4444" text={`Rejected: ${getStatusCount('REJECTED')}`} />
                    <LegendItem color="#10b981" text={`Approved with Feedback: ${getStatusCount('APPROVED_WITH_FEEDBACK')}`} />
                    <LegendItem color="#16a34a" text={`Final: ${getStatusCount('FINAL')}`} />
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-2xl font-semibold mb-4">Summary</h2>
          <CourseTotal courseId={courseId} />
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

  const counts = {
    NOT_SUBMITTED: statusCounts?.NOT_SUBMITTED || 0,
    SUBMITTED: statusCounts?.SUBMITTED || 0,
    REJECTED: statusCounts?.REJECTED || 0,
    APPROVED_WITH_FEEDBACK: statusCounts?.APPROVED_WITH_FEEDBACK || 0,
    FINAL: statusCounts?.FINAL || 0,
  };

  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

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
    NOT_SUBMITTED: '#6b7280',
    SUBMITTED: '#1d4ed8',
    REJECTED: '#ef4444',
    APPROVED_WITH_FEEDBACK: '#10b981',
    FINAL: '#16a34a',
  };

  let currentAngle = 0;
  const segments = Object.entries(counts)
    .filter(([, count]) => count > 0)
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
          transform: 'rotate(-90deg)'
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