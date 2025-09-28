"use client";

import React, { useCallback, useState, useEffect } from "react";
import Image from "next/image";
import { Bell, Home, User } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import NotificationPopup from "./notification";
import { getCourse, Course } from "@/types/api/course";
import { getCourseAPI } from "@/api/course/getCourseByUser";
import { getUserRole } from "@/util/cookies";
import { getCourseNameAPI } from "@/api/course/getCourseName";
import { getCoursename } from "@/types/api/course";

export default function Navbar() {
  const searchParams = useSearchParams();
  
  const courseId = searchParams.get("courseId");

  const [showNotification, setShowNotification] = useState(false);
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courseData, setCourseData] = useState<getCoursename.CourseName | null>(null);

  const fetchCourses = useCallback(async () => {
    if (!userRole || !courseId || courseId.trim() === "") {
      setLoading(false);
      setCourseData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);


      const res = await getCourseNameAPI(courseId);
      setCourseData(res.data);
    } catch (err: any) {
      console.error("Error fetching courses:", err);
      setError("Failed to fetch courses");
      setCourseData(null);
    } finally {
      setLoading(false);
    }
  }, [userRole, courseId]);

  useEffect(() => {
    const role = getUserRole();
    setUserRole(role);
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <>
      <div className="w-full flex items-center justify-between px-6 py-3 bg-white border-b shadow-sm font-dbheavent">
        <div className="flex items-center gap-4">
          <Image src="/image/SIT-LOGO.png" alt="SIT Logo" width={100} height={40} />          
          {/* {courseId && courseData?.coursename && (
            <span className="text-4xl font-semibold">
              {courseData.coursename}
            </span>
          )} */}
          <h1 className="text-4xl font-semibold">Capstone Report Submission System</h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative cursor-pointer" onClick={() => setShowNotification(!showNotification)}>
            <Bell className="w-6 h-6 text-black" />
            {/* <span className="absolute -top-1 -right-2 text-[10px] px-1 bg-red-600 text-white rounded-full">15</span> */}
          </div>
          <Home className="w-6 h-6 text-black cursor-pointer" onClick={() => router.push("/course")} />
          <User className="w-6 h-6 text-black cursor-pointer" onClick={() => router.push("/profile")} />
        </div>
      </div>

      {showNotification && <NotificationPopup onClose={() => setShowNotification(false)} />}
    </>
  );
}