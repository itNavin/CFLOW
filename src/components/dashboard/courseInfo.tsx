"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Dashboard } from "@/types/api/dashboard";
import { getDashboardData } from "@/api/dashboard/getDashboard";

interface CourseInfoProps {
  courseId?: string;
  showFields?: {
    name?: boolean;
    description?: boolean;
    program?: boolean;
    createdDate?: boolean;
    createdBy?: boolean;
  };
}

export default function CourseInfo({ 
  courseId: propCourseId, 
  showFields = {
    name: true,
    description: true,
    program: true,
    createdDate: true,
    createdBy: true
  }
}: CourseInfoProps = {}) {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard.Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Use prop courseId or get from URL
  const courseId = propCourseId || searchParams.get("courseId") || "";

  const fetchDashboardData = async () => {
    try {
      if (!courseId) {
        setError("No course ID provided");
        return;
      }

      const id = Number(courseId);
      if (Number.isNaN(id)) {
        setError("Invalid courseId");
        return;
      }

      setLoading(true);
      setError(null);
      
      // ✅ Using your API function with proper typing
      const response = await getDashboardData(id);
      setDashboard(response.data);
      console.log("CourseInfo - Dashboard data:", response.data);
    } catch (error) {
      setError("Failed to load course data");
      console.error("CourseInfo - Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [courseId]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-2 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-red-600 p-3 bg-red-50 rounded-lg">
        <p className="font-semibold">Error loading course information</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  // No data state - using your Dashboard.Dashboard type
  if (!dashboard?.course) {
    return (
      <div className="text-gray-500 p-3 bg-gray-50 rounded-lg">
        No course information available
      </div>
    );
  }

  // ✅ Using your exact Dashboard.course type structure
  const course = dashboard.course;

  return (
    <div className="space-y-2">
      {showFields.name && (
        <InfoRow 
          label="Class Name" 
          value={course.name || "Unknown"} 
        />
      )}
      
      {showFields.description && (
        <InfoRow 
          label="Description" 
          value={course.description || "No description available"} 
        />
      )}
      
      {showFields.program && (
        <InfoRow 
          label="Program Type" 
          value={course.program || "Unknown"} 
        />
      )}
      
      {showFields.createdDate && (
        <InfoRow 
          label="Created Date" 
          value={formatUploadAt(course.createdAt)} 
        />
      )}
      
      {showFields.createdBy && (
        <InfoRow 
          label="Created By" 
          value={course.createdBy?.name || "Unknown"} 
        />
      )}
    </div>
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