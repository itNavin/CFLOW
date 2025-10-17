"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { getCourseAPI } from "@/api/course/getCourseByUser";
import { getStaffCourseAPI } from "@/api/course/getStaffCourse";
import { getUserRole } from "@/util/cookies";
import { Course } from "@/types/api/course";
import { CourseModal } from "../../components/course/courseModal";
import { UploadMemberModal } from "../../components/course/uploadMember";
import { createCourse } from "@/types/api/course";
import { createCourseAPI } from "@/api/course/createCourse";
import { deleteCourseAPI } from "@/api/course/deleteCourse";
import { isCanUpload } from "@/util/RoleHelper";
import { updateCourse } from "@/types/api/course";
import { updateCourseAPI } from "@/api/course/updateCourse";
import ErrorPopUp from "@/components/errorPopUp";

const asArray = <T = any>(data: any, key?: string): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (key && Array.isArray(data?.[key])) return data[key] as T[];
  return [];
};

const pickArray = <T = any>(res: any, key?: string): T[] => {
  const candidates = [res?.data, res?.data?.data, res]; // support {data:{...}}, {data:[]}, or bare array
  for (const base of candidates) {
    const arr = asArray<T>(base, key);
    if (arr.length) return arr;
  }
  return [];
};

export default function CoursePage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | undefined>(undefined);
  const [courses, setCourses] = useState<Course[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canUpload, setCanUpload] = useState(false);
  const [openUploadMember, setOpenUploadMember] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    setUserRole(getUserRole());
    setCanUpload(isCanUpload()); 
  }, []);

  const fetchCourses = useCallback(async () => {
    if (userRole === undefined) return; 

    try {
      setLoading(true);
      setError(null);

      if (userRole === "staff" || userRole === "SUPER_ADMIN") {
        const res = await getStaffCourseAPI(); 
        const list = pickArray<Course>(res, "course");
        setCourses(list);
      } else {
        const res = await getCourseAPI(); 
        const memberships = pickArray<any>(res, "course");
        const list: Course[] = memberships
          .map((m) => m?.course ?? m)
          .filter(Boolean);
        setCourses(list);
      }
    } catch (err: any) {
      setError(
        err?.response?.status
          ? `Failed to fetch courses (HTTP ${err.response.status})`
          : err instanceof Error
            ? err.message
            : "Failed to fetch courses"
      );
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    if (userRole !== undefined) {
      fetchCourses();
    }
  }, [userRole, fetchCourses]);

  const handleCourseClick = (course: Course) => {
    if (!userRole) return;
    const base =
      userRole === "staff" || userRole === "SUPER_ADMIN"
        ? "/admin"
        : userRole === "lecturer"
          ? "/advisor"
          : "/student";
    router.push(`${base}?courseId=${encodeURIComponent(course.id)}`);
  };

  const handleCreateCourse = async (payload: Omit<Course, "id" | "createdById" | "createdAt">) => {
    try {
      setLoading(true);
      setError(null);

      const response = await createCourseAPI(
        payload.program,
        payload.name,
        payload.description || null
      );
      await fetchCourses();

      setOpenCreate(false);
    } catch (err: any) {
      setError(
        err?.response?.status
          ? `Failed to create course (HTTP ${err.response.status})`
          : err instanceof Error
            ? err.message
            : "Failed to create course"
      );
    } finally {
      setLoading(false);
    }
  };
  {
    openCreate && (
      <CourseModal
        mode="create"
        onClose={() => setOpenCreate(false)}
        onSubmit={handleCreateCourse}
      />
    )
  }

  const handleEditCourse = async (payload: Omit<Course, "id">) => {
    if (!editing) return;

    try {
      setUpdating(true);
      setError(null);
      const response = await updateCourseAPI(
        editing.id,
        payload.name,
        payload.description || null
      );
      setCourses((prev) =>
        prev.map((c) => 
          c.id === editing.id 
            ? {
                id: response.data.course.id,
                name: response.data.course.name,
                description: response.data.course.description || "",
                program: response.data.course.program,
              }
            : c
        )
      );

      setEditing(null);

      // Show success message
      alert("Course updated successfully!");

    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to update course";
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
      throw err; 
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteCourse = async (course: Course) => {
    setCourseToDelete(course);
    setOpenMenuId(null);
  };

  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;

    try {
      setDeleting(true);
      setError(null);
      
      await deleteCourseAPI(courseToDelete.id);
      setCourses((prev) => prev.filter((c) => c.id !== courseToDelete.id));
      setCourseToDelete(null);
    } catch (err: any) {
      setError(
        err?.response?.status
          ? `Failed to delete course (HTTP ${err.response.status})`
          : err instanceof Error
            ? err.message
            : "Failed to delete course"
      );
    } finally {
      setDeleting(false);
    }
  };

  const toggleMenu = (id: string) => setOpenMenuId((prev) => (prev === id ? null : id));

  const closeMenusOnOutsideClickRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        closeMenusOnOutsideClickRef.current &&
        !closeMenusOnOutsideClickRef.current.contains(e.target as Node)
      ) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (userRole === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="p-6 font-dbheavent bg-white min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[30px] font-medium text-black">Course</h2>

          {userRole === "staff" && (
            <div className="flex gap-3">
              <button
                onClick={() => setOpenCreate(true)}
                className="flex items-center bg-gradient-to-r from-[#326295] to-[#0a1c30] text-white text-[16px] px-4 py-2 rounded shadow hover:from-[#28517c] hover:to-[#071320]"
              >
                <span className="text-2xl mr-2">+</span> Create Course
              </button>
            </div>
          )}
        </div>

        <div ref={closeMenusOnOutsideClickRef} className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-lg text-gray-600">Loading courses...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-lg text-red-600">Error: {error}</div>
              <button
                onClick={fetchCourses}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-lg text-gray-600">No courses found</div>
            </div>
          ) : (
            courses.map((course) => (
              <div
                key={course.id}
                className="relative flex justify-between items-center p-4 border rounded-md shadow-sm bg-white hover:shadow-md transition"
              >
                <div
                  className="text-[18px] text-black cursor-pointer hover:text-blue-600 hover:underline flex-1"
                  onClick={() => handleCourseClick(course)}
                  title="Click to view course details"
                >
                  {course.name}
                </div>

                {canUpload && (
                  <button
                    onClick={() => toggleMenu(course.id)}
                    className="text-[24px] text-gray-600 hover:text-black px-2"
                    aria-haspopup="menu"
                    aria-expanded={openMenuId === course.id}
                  >
                    &#8230;
                  </button>
                )}

                {canUpload && openMenuId === course.id && (
                  <div className="absolute right-4 top-14 bg-white border border-gray-200 rounded-md shadow-md z-10 w-32">
                    <button
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                      onClick={() => {
                        setEditing(course);
                        setOpenMenuId(null);
                      }}
                    >
                      Edit
                    </button>
                    {/* <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">
                      Hide
                    </button> */}
                    <button
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                      onClick={() => {
                        handleDeleteCourse(course);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {courseToDelete && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-50" />
          <div className="fixed inset-0 z-50 grid place-items-center p-4">
            <div className="w-full max-w-md rounded-2xl border bg-white shadow-xl">
              <div className="px-6 py-4 border-b">
                <h3 className="text-xl font-semibold text-gray-900">Delete Course</h3>
              </div>
              
              <div className="px-6 py-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      Are you sure you want to delete this course?
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>" {courseToDelete.name} "</strong>
                    </p>
                  </div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-800">
                    <strong>Warning:</strong> All course data and related data will be permanently deleted.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
                <button
                  onClick={() => setCourseToDelete(null)}
                  disabled={deleting}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteCourse}
                  disabled={deleting}
                  className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {deleting ? "Deleting..." : "Delete Course"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {openCreate && (
        <CourseModal
          mode="create"
          onClose={() => setOpenCreate(false)}
          onSubmit={handleCreateCourse}
        />
      )}

      {editing && (
        <CourseModal
          mode="edit"
          initial={editing}
          onClose={() => setEditing(null)}
          onSubmit={handleEditCourse}
        />
      )}

      <ErrorPopUp message={error || ""} onClose={() => setError(null)} />
    </>
  );
}
