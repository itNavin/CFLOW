"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getDashboardData } from "@/api/dashboard/getDashboard";
import type { Dashboard } from "@/types/api/dashboard";

interface CourseTotalProps {
  courseId?: string;
  groupId?: number;
  assignmentId?: number;
  showFields?: {
    students?: boolean;
    advisors?: boolean;
    groups?: boolean;
    assignments?: boolean;
  };
}

export default function CourseTotal({ 
  courseId: propCourseId,
  groupId,
  assignmentId,
  showFields = {
    students: true,
    advisors: true,
    groups: true,
    assignments: true
  }
}: CourseTotalProps = {}) {
  const searchParams = useSearchParams();
  const [dashboard, setDashboard] = useState<Dashboard.Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const courseId = propCourseId || searchParams.get("courseId") || "";

  const fetchDashboardData = async () => {
    try {
      if (!courseId) {
        setError("No course ID provided");
        setLoading(false);
        return;
      }

      const id = Number(courseId);
      if (Number.isNaN(id)) {
        setError("Invalid course ID");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const query: { groupId?: number; assignmentId?: number } = {};
      if (groupId !== undefined) query.groupId = groupId;
      if (assignmentId !== undefined) query.assignmentId = assignmentId;

      const response = await getDashboardData(id, query);
      setDashboard(response.data);
      console.log("CourseTotal - Dashboard data:", response.data);
    } catch (error: any) {
      console.error("CourseTotal - Dashboard fetch error:", error);
      setError("Failed to load course totals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [courseId, groupId, assignmentId]);
  if (loading) {
    return (
      <div className="text-center text-gray-500 py-4">
        Loading course totals...
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-red-600 p-3 bg-red-50 rounded-lg">
        <p className="font-semibold">Error loading course totals</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }
  if (!dashboard?.totals) {
    return (
      <div className="text-gray-500 p-3 bg-gray-50 rounded-lg">
        No course data available
      </div>
    );
  }

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-lg">
      {showFields.students && (
        <DT label="Total Students" value={dashboard.totals.students ?? 0} />
      )}
      {showFields.advisors && (
        <DT label="Total Advisors" value={dashboard.totals.advisors ?? 0} />
      )}
      {showFields.groups && (
        <DT label="Total Groups" value={dashboard.totals.groups ?? 0} />
      )}
      {showFields.assignments && (
        <DT label="Total Assignments" value={dashboard.totals.assignments ?? 0} />
      )}
    </dl>
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