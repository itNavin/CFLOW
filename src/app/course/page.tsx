"use client";

import React, { useEffect, useRef, useState } from "react";
import Navbar from "@/components/navbar";
import { getCourseAPI } from "@/api/course/getCourse";
import { getCourse } from "@/types/api/course";

type Course = {
  id: number;
  name: string;
  program: "CS" | "DSI";   
  description?: string; 
};

export default function CoursePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch courses from API
  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the API (parameters aren't used in the actual API call)
      const response = await getCourseAPI(1, "", "", "", "STUDENT");
      
      // Transform the API response to match our Course type
      const transformedCourses: Course[] = response.data.courses.map(courseItem => ({
        id: courseItem.course.id,
        name: courseItem.course.name,
        program: courseItem.course.program,
        description: courseItem.course.description,
      }));
      
      setCourses(transformedCourses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch courses');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

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

  return (
    <>
      <Navbar />
      <div className="p-6 font-dbheavent bg-white min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[30px] font-medium text-black">Courses</h2>

          <button
            onClick={() => setOpenCreate(true)}
            className="flex items-center bg-gradient-to-r from-[#326295] to-[#0a1c30] text-white text-[16px] px-4 py-2 rounded shadow hover:from-[#28517c] hover:to-[#071320]"
          >
            <span className="text-xl mr-2">+</span> Create Courses
          </button>
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
                <div className="text-[18px] text-black">{course.name}</div>

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
              // For now, just add locally - you can implement actual API call later
              const newCourse: Course = {
                id: Date.now(), // temporary ID
                name: payload.name,
                program: payload.program,
                description: payload.description,
              };
              setCourses((prev) => [newCourse, ...prev]);
              setOpenCreate(false);
              
              // TODO: Call actual create course API here
              // await createCourseAPI(payload);
              // await fetchCourses(); // Refresh the list
            } catch (err) {
              console.error('Error creating course:', err);
              setError('Failed to create course');
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
              // For now, just update locally - you can implement actual API call later
              setCourses((prev) =>
                prev.map((c) => (c.id === editing.id ? { ...c, ...payload } : c))
              );
              setEditing(null);
              
              // TODO: Call actual update course API here
              // await updateCourseAPI(editing.id, payload);
              // await fetchCourses(); // Refresh the list
            } catch (err) {
              console.error('Error updating course:', err);
              setError('Failed to update course');
            }
          }}
        />
      )}
    </>
  );
}

/* ----------------------------- Modal ----------------------------- */

function CourseModal({
  mode,
  initial,
  onClose,
  onSubmit,
}: {
  mode: "create" | "edit";
  initial?: Course;
  onClose: () => void;
  onSubmit: (c: Omit<Course, "id">) => void;
}) {
  const [program, setProgram] = useState<"CS" | "DSI">(initial?.program ?? "CS");
  const [name, setName] = useState<string>(initial?.name ?? "");
  const [description, setDescription] = useState<string>(initial?.description ?? "");

  const canSubmit = name.trim().length > 0 && !!program;

  const panelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" />
      <div className="fixed inset-0 z-40 grid place-items-center p-4">
        <div
          ref={panelRef}
          className="w-full max-w-2xl rounded-2xl border bg-white shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 className="text-[28px] font-medium">
              {mode === "create" ? "Create Course" : "Edit Course"}
            </h3>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-2xl leading-none text-red-500 hover:text-red-600"
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-6 text-black">
            {/* Program */}
            <div>
              <div className="text-[18px] font-semibold mb-2">
                Course<span className="text-red-500">*</span>
              </div>
              <div className="flex items-center gap-8">
                <label className="inline-flex items-center gap-2 text-[16px]">
                  <input
                    type="radio"
                    name="program"
                    value="CS"
                    checked={program === "CS"}
                    onChange={() => setProgram("CS")}
                  />
                  CS
                </label>
                <label className="inline-flex items-center gap-2 text-[16px]">
                  <input
                    type="radio"
                    name="program"
                    value="DSI"
                    checked={program === "DSI"}
                    onChange={() => setProgram("DSI")}
                  />
                  DSI
                </label>
              </div>
            </div>

            {/* Course name */}
            <div>
              <div className="text-[18px] font-semibold mb-2">
                Course name<span className="text-red-500">*</span>
              </div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., CSC498-CSC499[2026]"
                className="w-full text-[16px] rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]"
              />
            </div>

            {/* Description */}
            <div>
              <div className="text-[18px] font-semibold mb-2">Description</div>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                className="w-full text-[16px] rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t flex justify-end">
            <button
              disabled={!canSubmit}
              onClick={() =>
                onSubmit({
                  name: name.trim(),
                  program,
                  description: description.trim(),
                })
              }
              className="rounded px-6 py-2 text-white shadow disabled:opacity-60 bg-gradient-to-r from-[#326295] to-[#0a1c30] hover:from-[#28517c] hover:to-[#071320]"
            >
              {mode === "create" ? "Create" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
