"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Pencil } from "lucide-react";
import { Dashboard } from "@/types/api/dashboard";
import { getDashboardData } from "@/api/dashboard/getDashboard";
import { CourseModal } from "@/components/course/courseModal";
import { updateCourseAPI } from "@/api/course/updateCourse";
import { Course } from "@/types/api/course";
import { isCanUpload } from "@/util/RoleHelper";
import { useToast } from "../toast";

interface CourseInfoProps {
  courseId?: string;
  showFields?: {
    name?: boolean;
    description?: boolean;
    program?: boolean;
    createdDate?: boolean;
    createdBy?: boolean;
  };
  showHeader?: boolean;
  onCourseUpdated?: () => void;
}

export default function CourseInfo({
  courseId: propCourseId,
  showFields = {
    name: true,
    description: true,
    program: true,
    createdDate: true,
    createdBy: true,
  },
  showHeader = true,
  onCourseUpdated,
}: CourseInfoProps = {}) {
  const searchParams = useSearchParams();
  const effectiveCourseId = useMemo(
    () => propCourseId ?? searchParams.get("courseId") ?? "",
    [propCourseId, searchParams]
  );

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard.Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseData, setCourseData] = useState<Course | null>(null);
  const canEdit = mounted && isCanUpload();
  const { showToast } = useToast();

  const fetchDashboardData = async () => {
    try {
      if (!effectiveCourseId?.trim()) {
        setError("No course ID provided");
        return;
      }
      setLoading(true);
      setError(null);
      const response = await getDashboardData(effectiveCourseId);
      setDashboard(response.data);
    } catch (error) {
      setError("Failed to load course data");
      console.error("CourseInfo - Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = () => {
    if (!dashboard?.course?.course) {
      setError("No course data available to edit");
      return;
    }
    const info = dashboard.course.course;
    const next: Course = {
      id: effectiveCourseId,
      name: info.name || "",
      description: info.description || "",
      program: (info.program as "CS" | "DSI") || "CS",
    };
    setCourseData(next);
    setShowCourseModal(true);    
  };

  const handleUpdateCourse = async (updatedCourse: Omit<Course, "id">) => {
    try {
      await updateCourseAPI(
        effectiveCourseId,
        updatedCourse.name,
        updatedCourse.description || null
      );
      setShowCourseModal(false);
      await fetchDashboardData();
      onCourseUpdated?.();
      showToast({ variant: "success", message: "Course updated successfully" });
    } catch (error: any) {
      console.error("Failed to update course:", error);
      const msg = error.response?.data?.message || error.message || "Unknown error";
      setError(`Failed to update course: ${msg}`);
      showToast({ variant: "error", message: String(msg) });
      throw error;
    }
    window.location.reload();
  };

  useEffect(() => {
    fetchDashboardData();
  }, [effectiveCourseId]);

  const Header = ({ title }: { title: string }) =>
    !showHeader ? null : (
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {canEdit && <button
          onClick={canEdit ? handleEditCourse : undefined}
          disabled={loading || !canEdit}
          className={`p-2 rounded-md ${loading || !canEdit ? "bg-gray-100 cursor-not-allowed" : "hover:bg-gray-100"}`}
          title={canEdit ? "Edit Course" : "You don't have permission to edit"}
          aria-disabled={loading || !canEdit}
        >
          <Pencil className={`w-4 h-4 ${loading || !canEdit ? "text-gray-400" : "text-gray-700"}`} />
        </button>}
      </div>
    );

  if (loading) {
    return (
      <div>
        <Header title="Course Information" />
        <div className="space-y-2 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header title="Course Information" />
        <div className="text-red-600 p-3 bg-red-50 rounded-lg">
          <p className="font-semibold">Error loading course information</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchDashboardData();
            }}
            className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard?.course) {
    return (
      <div>
        <Header title="Course Information" />
        <div className="text-gray-500 p-3 bg-gray-50 rounded-lg">
          No course information available
        </div>
      </div>
    );
  }

  const course = dashboard.course;

  return (
    <>
      <div>
        <Header title="Course Information" />

        <div className="space-y-2">
          {showFields.name && (
            <InfoRow label="Course Name" value={course.course.name || "Unknown"} />
          )}

          {showFields.description && (
            <InfoRow
              label="Description"
              value={course.course.description || "No description available"}
            />
          )}

          {showFields.program && (
            <InfoRow label="Program Type" value={course.course.program || "Unknown"} />
          )}

          {showFields.createdDate && (
            <InfoRow
              label="Created Date"
              // ✅ Avoid server-side locale formatting; show placeholder until mounted
              value={mounted ? formatUploadAt(course.course.createdAt) : "—"}
            />
          )}

          {showFields.createdBy && (
            <InfoRow label="Created By" value={course.course.createdBy?.name || "Unknown"} />
          )}
        </div>
      </div>

      {showCourseModal && courseData && (
        <CourseModal
          mode="edit"
          initial={courseData}
          onClose={() => {
            setShowCourseModal(false);
            setCourseData(null);
          }}
          onSubmit={handleUpdateCourse}
        />
      )}
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="py-2">
      <div className="text-lg font-bold text-gray-900">{label}</div>
      <div className="text-lg text-gray-900">{value}</div>
    </div>
  );
}

function formatUploadAt(dateString: string) {
  if (!dateString) return "Unknown";
  try {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "Invalid date";
    return d.toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      timeZone: "Asia/Bangkok",
    });
  } catch {
    return "Invalid date";
  }
}