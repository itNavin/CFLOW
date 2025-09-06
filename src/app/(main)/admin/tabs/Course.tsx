"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Pencil, AlertTriangle, FilePlus2, Megaphone, Upload } from "lucide-react";
import { getDashboardData } from "@/api/dashboard/getDashboard";
import type { Dashboard } from "@/types/api/dashboard";

export default function CourseTab() {
  const searchParams = useSearchParams();

  const [dashboardData, setDashboardData] = useState<Dashboard.Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const courseId = searchParams.get("courseId") || "";

  const toDateOrNull = (v: unknown): Date | null => {
    if (!v) return null;
    const d = new Date(v as any);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatShortDate = (dateInput: Date | null | undefined): string => {
    if (!dateInput) return "Unknown";
    return dateInput.toLocaleDateString("en-US");
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // read from URL: /admin?courseId=2
        const courseIdParam = searchParams.get("courseId");
        const courseId = courseIdParam ? Number(courseIdParam) : NaN;

        if (!courseIdParam || Number.isNaN(courseId) || courseId <= 0) {
          setDashboardData(null);
          setError("Missing or invalid courseId in the URL.");
          return;
        }

        setDashboardLoading(true);
        const res = await getDashboardData(courseId);
        // console.log("Response data:", res.data);
        setDashboardData(res.data as Dashboard.Dashboard);
      } catch (e: any) {
        console.error("Error loading dashboard:", e?.response?.status, e?.response?.data || e);
        setError(
          e?.response?.status
            ? `Failed to load dashboard (HTTP ${e.response.status})`
            : "Failed to load dashboard"
        );
        setDashboardData(null);
      } finally {
        setDashboardLoading(false);
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  // Build display info purely from API data
  const courseInfo = dashboardData?.course ?? null;

  const displayInfo = courseInfo
    ? {
      name: courseInfo.name ?? "Unknown",
      description: courseInfo.description ?? "No description available",
      program: courseInfo.program ?? "Unknown",
      createdAt: toDateOrNull((courseInfo as any).createdAt), // Date | null
      createdBy: courseInfo?.createdBy.name ?? "Unknown",
      // (courseInfo as any)?.createBy?.fullName
      //   ? (courseInfo as any).createBy.fullName
      //   : "Unknown",
    }
    : {
      name: "No course selected",
      description: "Please select a course",
      program: "Unknown" as const,
      createdAt: null as Date | null,
      createdByName: "Unknown",
    };

  if (loading) {
    return <div className="p-6">Loading course information...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        {error} — add <code>?courseId=&lt;id&gt;</code> to the URL.
      </div>
    );
  }

  const getSubmissionData = () => {
    if (!dashboardData?.submissions?.statusCounts) {
      return { segments: [], total: 0, allStatuses: [] };
    }

    const counts = dashboardData.submissions.statusCounts;
    const statusConfig = [
      { key: 'NOT_SUBMITTED', color: '#6b7280', label: 'Not Submitted' },
      { key: 'SUBMITTED', color: '#1d4ed8', label: 'Submitted' },
      { key: 'REJECTED', color: '#ef4444', label: 'Rejected' },
      { key: 'APPROVED_WITH_FEEDBACK', color: '#f59e0b', label: 'Approved with Feedback' },
      { key: 'FINAL', color: '#16a34a', label: 'Final' }
    ];

    const total = Object.values(counts).reduce((sum, count) => sum + (count || 0), 0);

    let currentAngle = 0;
    const segments = statusConfig.map(status => {
      const count = counts[status.key as keyof typeof counts] || 0;
      const percentage = total > 0 ? (count / total) * 100 : 0;
      const angle = total > 0 ? (count / total) * 360 : 0;

      const segment = {
        ...status,
        count,
        percentage: Math.round(percentage),
        startAngle: currentAngle,
        endAngle: currentAngle + angle
      };

      currentAngle += angle;
      return segment;
    }).filter(segment => segment.count > 0); // Only segments with data for donut

    // All statuses for legend (including 0 counts)
    const allStatuses = statusConfig.map(status => ({
      ...status,
      count: counts[status.key as keyof typeof counts] || 0,
      percentage: total > 0 ? Math.round(((counts[status.key as keyof typeof counts] || 0) / total) * 100) : 0
    }));

    return { segments, total, allStatuses };
  };

  const submissionData = getSubmissionData();

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
            <InfoRow label="Class Name" value={displayInfo.name} />
            <InfoRow label="Description" value={displayInfo.description} />
            <InfoRow label="Program Type" value={displayInfo.program} />
            <InfoRow label="Created Date" value={formatShortDate(displayInfo.createdAt)} />
            <InfoRow label="Created By" value={displayInfo.createdBy} />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Dashboard</h2>
              <div className="flex gap-3">
                <label className="text-xl text-gray-600">Filter</label>
                <select className="block border border-gray-300 rounded px-2 py-1 text-lg">
                  <option>Overall</option>
                  <option>Upcoming Due Dates</option>
                  <option>Upcoming End Dates</option>
                  <option>Custom Filter</option>
                </select>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="flex items-center justify-center">
                <MultiColorDonut
                  segments={submissionData.segments}
                  total={submissionData.total}
                />
              </div>
              <ul className="space-y-2 text-lg">
                {submissionData.allStatuses.map(status => (
                  <LegendItem
                    key={status.key}
                    color={status.color}
                    text={`${status.label}: ${status.count} (${status.percentage}%)`}
                  />
                ))}
              </ul>
            </div>

            {/* <div className="mt-3">
              <Link href="#" className="text-lg text-[#326295] hover:underline">
                More Detail
              </Link>
            </div> */}
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
            <DT label="Total Students" value={dashboardData?.totals.students ?? 0} />
            <DT label="Total Advisors" value={dashboardData?.totals.advisors ?? 0} />
            <DT label="Total Groups" value={dashboardData?.totals.groups ?? 0} />
            <DT label="Total Assignments" value={dashboardData?.totals.assignments ?? 0} />
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
