import React, { useEffect, useState } from "react";
import { getProfile } from "@/types/api/profile";
import { getProfileAPI } from "@/api/profile/getProfile";

export default function CourseDetailCard() {
  const [courses, setCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getProfileAPI();
        // Adjust based on your API response structure
        setCourses(response.data.profile?.courseNames ?? []);
      } catch (err: any) {
        console.error("Error fetching courses:", err);
        setError("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="border rounded-md p-4">
        <h3 className="font-semibold mb-2">Course Detail</h3>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-md p-4">
        <h3 className="font-semibold mb-2">Course Detail</h3>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md p-4">
      <h3 className="font-semibold mb-2">Course Detail</h3>
      {courses.length > 0 ? (
        courses.map((course, index) => (
          <p key={index}>
            {course}
          </p>
        ))
      ) : (
        <p><strong>Course</strong><br />No courses enrolled</p>
      )}
    </div>
  );
}