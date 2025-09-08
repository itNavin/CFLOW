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
  const [groupInfo, setGroupInfo] = useState<Dashboard.studentInfo[]>([]);
  const [assignments, setAssignments] = useState<getAllAssignments.allAssignment[]>([]);
  
  // ✅ FIXED: Use group ID directly instead of studentInfo object
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedAssignmentChartId, setSelectedAssignmentChartId] = useState<number | null>(null);
  const courseId = searchParams.get("courseId") || "";

  // ✅ FIXED: Simplified group change handler
  const handleChartGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const groupId = Number(e.target.value);
    
    console.log("Selected group ID:", groupId); // Debug log
    
    if (groupId === -1) {
      // "All Groups" selected
      setSelectedGroupId(null);
      fetchDashboardDataWithQuery({
        groupId: undefined,
        assignmentId: selectedAssignmentChartId || undefined
      });
    } else {
      // Specific group selected
      setSelectedGroupId(groupId);
      fetchDashboardDataWithQuery({
        groupId: groupId,
        assignmentId: selectedAssignmentChartId || undefined
      });
    }
  };

  // ✅ FIXED: Simplified assignment change handler
  const handleChartAssignmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const assignmentId = Number(e.target.value);
    
    console.log("Selected assignment ID:", assignmentId); // Debug log
    
    setSelectedAssignmentChartId(assignmentId > 0 ? assignmentId : null);

    fetchDashboardDataWithQuery({ 
      assignmentId: assignmentId > 0 ? assignmentId : undefined, 
      groupId: selectedGroupId || undefined 
    });
  };

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
      console.log("Group information:", response.data); // Debug log
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
      console.log("Dashboard data:", response.data); // Debug log
    } catch (error) {
      setError("Failed to load dashboard data");
    }
  };

  // ✅ FIXED: Added better error handling and logging
  const fetchDashboardDataWithQuery = async (query: { assignmentId?: number; groupId?: number }) => {
    try {
      if (!courseId) return;
      setDashboardLoading(true);
      
      const id = Number(courseId);
      if (Number.isNaN(id)) {
        setError("Invalid courseId in URL");
        return;
      }
      
      console.log("Fetching dashboard with query:", query); // Debug log
      
      const response = await getDashboardData(id, query);
      console.log("Dashboard response with query:", response.data);

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

      const id = Number(courseId);
      if (Number.isNaN(id)) {
        setError("Invalid courseId in URL");
        return;
      }
      const response = await getAllAssignmentsAPI(id);
      console.log("Assignments:", response.data); // Debug log
      setAssignments(response.data);
    } catch (error) {
      console.error("Failed to load assignments:", error);
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
      console.log("All groups:", response.data); // Debug log
      setGroup(response.data);
    } catch (error) {
      console.error("Failed to load groups:", error);
      setError("Failed to load groups");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchGroupInformation();
      await fetchDashboardData();
      await fetchAssignments();
      await fetchAllGroup();
      setLoading(false);
    };
    fetchData();
  }, [courseId]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Class Information</h2>
              {/* <button className="p-2 rounded-md hover:bg-gray-100">
                <Pencil className="w-4 h-4 text-gray-700" />
              </button> */}
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
            {/* ✅ FIXED: Reordered filters and improved layout */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <h2 className="text-2xl font-semibold">Dashboard</h2>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Assignment Filter */}
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

                {/* Group Filter */}
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
                  statusCounts={dashboard?.submissions?.statusCounts}
                  loading={dashboardLoading}
                />
              </div>
              <ul className="space-y-2 text-lg">
                {dashboard && (
                  <>
                    <LegendItem color="#6b7280" text={`Not Submitted: ${dashboard.submissions?.statusCounts.NOT_SUBMITTED || 0}`} />
                    <LegendItem color="#1d4ed8" text={`Submitted: ${dashboard.submissions?.statusCounts.SUBMITTED || 0}`} />
                    <LegendItem color="#ef4444" text={`Rejected: ${dashboard.submissions?.statusCounts.REJECTED || 0}`} />
                    <LegendItem color="#10b981" text={`Approved with Feedback: ${dashboard.submissions?.statusCounts.APPROVED_WITH_FEEDBACK || 0}`} />
                    <LegendItem color="#16a34a" text={`Final: ${dashboard.submissions?.statusCounts.FINAL || 0}`} />
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
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
        </div> */}
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

/* --- Rest of your helper components remain the same --- */

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