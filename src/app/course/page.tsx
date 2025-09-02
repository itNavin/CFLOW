"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { getCourseAPI } from "@/api/course/getCourse";
import { getAllCourseAPI } from "@/api/course/getAllCourse";
import { getUserRole } from "@/util/cookies";
import { Course } from "@/types/api/course";
import { CourseModal } from "./component/courseModal";

// ---------------------------- Page ------------------------------- //
export default function CoursePage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | undefined>(undefined);
  const [courses, setCourses] = useState<Course[]>([]);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ------------------------ Data Fetching ------------------------ //
  const fetchCourses = async () => {
    if (userRole === undefined) return;
    try {
      setLoading(true);
      setError(null);

      console.log(userRole);

      if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
        const response = await getAllCourseAPI(); // GET /course
        setCourses(response.data);
      } else {
        const response = await getCourseAPI(); // GET /course/my-courses
        setCourses(response.data.courses.map(c => c.course));
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------ Navigation --------------------------- //
  const handleCourseClick = (course: Course) => {
    if (!userRole) return;

    switch (userRole) {
      case "STUDENT":
        router.push("/student");
        break;
      case "ADVISOR":
        router.push("/advisor");
        break;
      case "ADMIN":
      case "SUPER_ADMIN":
        router.push(`/course/admin/${course.id}`);
        break;
      default:
        console.error("Unknown user role:", userRole);
    }
  };

  const handleAddCourse = (newCourse: Omit<Course, "createdById" | "createdAt">) => {
    // Call API to add course
    console.log(newCourse);
  };

  useEffect(() => {
    setUserRole(getUserRole());
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole]);

  // -------------------- Menu (three-dots) UI --------------------- //
  const toggleMenu = (id: number) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

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

  if (userRole == undefined) {
    return <div>Loading...</div>;
  }

  // ---------------------------- UI ------------------------------- //
  return (
    <>
      <Navbar />
      <div className="p-6 font-dbheavent bg-white min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[30px] font-medium text-black">Courses</h2>

          {(userRole === "ADMIN" || userRole === "SUPER_ADMIN") && (
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

                <button
                  onClick={() => toggleMenu(course.id)}
                  className="text-[24px] text-gray-600 hover:text-black px-2"
                  aria-haspopup="menu"
                  aria-expanded={openMenuId === course.id}
                >
                  &#8230;
                </button>

                {openMenuId === course.id && (
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

        <div className="mt-6 text-sm font-medium text-black cursor-pointer hover:underline">
          Hide <span className="inline-block transform rotate-180">⌄</span>
        </div>
      </div>

      {openCreate && (
        <CourseModal
          mode="create"
          onClose={() => setOpenCreate(false)}
          onSubmit={async (payload) => {
            try {
              // For now, just add locally - replace with real create API if needed
              const newCourse: Omit<Course, "createdById" | "createdAt"> = {
                id: Date.now(), // temporary client ID
                name: payload.name,
                program: payload.program,
                description: payload.description,
              };
              handleAddCourse(newCourse);
              setOpenCreate(false);
            } catch (err) {
              console.error("Error creating course:", err);
              setError("Failed to create course");
            }
          }}
        />
      )}

      {editing && (
        <CourseModal
          mode="edit"
          initial={editing}
          onClose={() => setEditing(null)}
          onSubmit={async (payload) => {
            try {
              // For now, just update locally - replace with real update API if needed
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