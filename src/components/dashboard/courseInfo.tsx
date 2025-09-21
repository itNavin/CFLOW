"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Pencil } from "lucide-react";
import { Dashboard } from "@/types/api/dashboard";
import { getDashboardData } from "@/api/dashboard/getDashboard";
import { CourseModal } from "@/components/course/courseModal";
import { updateCourseAPI } from "@/api/course/updateCourse";
import { Course } from "@/types/api/course";
import { isCanUpload } from "@/util/RoleHelper";

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
    createdBy: true
  },
  showHeader = true,
  onCourseUpdated
}: CourseInfoProps = {}) {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard.Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseData, setCourseData] = useState<Course | null>(null);
  const courseId = searchParams.get("courseId") || "";
  const fetchDashboardData = async () => {
    try {
      if (!courseId) {
        setError("No course ID provided");
        return;
      }
      if (!courseId.trim()) {
        setError("Invalid courseId");
        return;
      }

      setLoading(true);
      setError(null);
      
      const response = await getDashboardData(courseId);
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

    const courseInfo = dashboard.course.course;
    const courseData: Course = {
      id: courseId,
      name: courseInfo.name || "",
      description: courseInfo.description || "",
      program: (courseInfo.program as "CS" | "DSI") || "CS",
    };

    setCourseData(courseData);
    setShowCourseModal(true);
    console.log("Opening edit modal with course data:", courseData);
  };

  const handleUpdateCourse = async (updatedCourse: Omit<Course, "id">) => {
    try {
      console.log("Updating course with data:", updatedCourse);
      
      const response = await updateCourseAPI(
        courseId, 
        updatedCourse.name, 
        updatedCourse.description || null
      );
      
      console.log("Update course response:", response.data);
      
      setShowCourseModal(false);
      
      await fetchDashboardData();
      
      if (onCourseUpdated) {
        onCourseUpdated();
      }
    } catch (error: any) {
      console.error("Failed to update course:", error);
      const errorMessage = error.response?.data?.message || error.message || "Unknown error";
      setError(`Failed to update course: ${errorMessage}`);
      throw error;
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [courseId]);

  if (loading) {
    return (
      <div>
        {showHeader && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Course Information</h2>
            {isCanUpload() && (
              <button 
                disabled
                className="p-2 rounded-md bg-gray-100 cursor-not-allowed"
              >
                <Pencil className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        )}
          <div className="space-y-2 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        {showHeader && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Course Information</h2>
            <button 
              disabled
              className="p-2 rounded-md bg-gray-100 cursor-not-allowed"
            >
              <Pencil className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        )}
        
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
        {showHeader && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Course Information</h2>
            <button 
              disabled
              className="p-2 rounded-md bg-gray-100 cursor-not-allowed"
            >
              <Pencil className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        )}
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
        {showHeader && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Course Information</h2>
            <button 
              onClick={handleEditCourse}
              className="p-2 rounded-md hover:bg-gray-100"
              title="Edit Course"
            >
              <Pencil className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        )}
        
        <div className="space-y-2">
          {showFields.name && (
            <InfoRow 
              label="Course Name" 
              value={course.course.name || "Unknown"} 
            />
          )}
          
          {showFields.description && (
            <InfoRow 
              label="Description" 
              value={course.course.description || "No description available"} 
            />
          )}
          
          {showFields.program && (
            <InfoRow 
              label="Program Type" 
              value={course.course.program || "Unknown"} 
            />
          )}
          
          {showFields.createdDate && (
            <InfoRow 
              label="Created Date" 
              value={formatUploadAt(course.course.createdAt)} 
            />
          )}
          
          {showFields.createdBy && (
            <InfoRow 
              label="Created By" 
              value={course.course.createdBy?.name || "Unknown"} 
            />
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