"use client";

import { removeAuthToken, removeUserRole } from "@/util/cookies";
import { stopTokenRefresh } from "@/util/TokenRefreshInterval";
import { useRouter } from "next/navigation";
import React, { Suspense } from "react";
import UserDetailCard from "@/components/profile/userDetail";
import CourseDetailCard from "@/components/profile/courseDetail";
import Navbar from "@/components/navbar";

export const dynamic = "force-dynamic";

export default function ProfilePage() {
  const navigator = useRouter()
  const handleLogout = () => {
    removeAuthToken()
    removeUserRole()
    stopTokenRefresh()
    navigator.replace("/auth/login")
  }
  return (
    <>
      <Suspense fallback={<div className="h-16 w-full bg-white shadow-sm" />}>
        <Navbar />
      </Suspense>
      <main className="min-h-screen bg-white p-6 font-dbheavent">

        <h2 className="text-3xl font-semibold mb-6">Profile</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UserDetailCard />
        <CourseDetailCard />
      </div>

      <div className="mt-8">
        <button onClick={handleLogout} className="px-4 py-2 bg-gradient-to-r from-red-500 to-black text-white rounded shadow hover:opacity-90">
          Log out
        </button>
      </div>
    </main>
  </>
  );
}
