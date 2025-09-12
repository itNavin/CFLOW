"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { getCourseAPI } from "@/api/course/getCourse";
import { getStaffCourseAPI } from "@/api/course/getStaffCourse";
import { getUserRole } from "@/util/cookies";
import { Course } from "@/types/api/course";
import { CourseModal } from "./component/courseModal";
import { createCourse } from "@/types/api/course";
import { createCourseAPI } from "@/api/course/createCourse";
import { isCanUpload } from "@/util/RoleHelper";

// tiny helpers
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
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canUpload, setCanUpload] = useState(false);
  const [uploadUserData, setUploadUserData] = useState<any>(null);

  useEffect(() => {
    setUserRole(getUserRole()); // "STUDENT" | "ADVISOR" | "ADMIN" | "SUPER_ADMIN" | undefined
    setCanUpload(isCanUpload()); // Set canUpload based on user role
  }, []);

  const fetchCourses = useCallback(async () => {
    if (userRole === undefined) return; // wait until role resolved

    try {
      setLoading(true);
      setError(null);

      if (userRole === "staff" || userRole === "SUPER_ADMIN") {
        const res = await getStaffCourseAPI(); // GET /course
        // accept: { courses: [...] } or [...]
        const list = pickArray<Course>(res, "course");
        setCourses(list);
      } else {
        const res = await getCourseAPI(); // GET /course/my-courses
        const memberships = pickArray<any>(res, "course");
        const list: Course[] = memberships
          .map((m) => m?.course ?? m) // if backend already returns pure Course, still works
          .filter(Boolean);
        setCourses(list);
      }
    } catch (err: any) {
      console.error("Error fetching courses:", err?.response?.status, err?.response?.data || err);
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

      // Call the actual API
      const response = await createCourseAPI(
        payload.program,
        payload.name,
        payload.description || null
      );
      await fetchCourses();

      setOpenCreate(false);
    } catch (err: any) {
      console.error("Error creating course:", err);
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
  const toggleMenu = (id: number) => setOpenMenuId((prev) => (prev === id ? null : id));

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
          <h2 className="text-[30px] font-medium text-black">Courses</h2>

          {userRole === "staff" && (
            <button
              onClick={() => setOpenCreate(true)}
              className="flex items-center bg-gradient-to-r from-[#326295] to-[#0a1c30] text-white text-[16px] px-4 py-2 rounded shadow hover:from-[#28517c] hover:to-[#071320]"
            >
              <span className="text-xl mr-2">+</span> Create Courses
            </button>
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
                    <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">
                      Hide
                    </button>
                    <button
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                      onClick={() => {
                        setCourses((prev) => prev.filter((c) => c.id !== course.id));
                        setOpenMenuId(null);
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

        {/* <div className="mt-6 text-sm font-medium text-black cursor-pointer hover:underline">
          Hide <span className="inline-block transform rotate-180">⌄</span>
        </div> */}
      </div>

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
          onSubmit={async (payload) => {
            try {
              setCourses((prev) =>
                prev.map((c) => (c.id === editing.id ? { ...c, ...payload } : c))
              );
              setEditing(null);
            } catch (err) {
              console.error("Error updating course:", err);
              setError("Failed to update course");
            }
          }}
        />
      )}
    </>
  );
}
