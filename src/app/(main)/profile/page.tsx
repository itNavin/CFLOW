"use client";

import React from "react";

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-white p-6 font-dbheavent">
      <h2 className="text-2xl font-semibold mb-6">Profile</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Detail */}
        <div className="border rounded-md p-4">
          <h3 className="font-semibold mb-2">User Detail</h3>
          <p><strong>Name</strong><br />Navin Dansaikul</p>
          <p className="mt-2"><strong>Email</strong><br />65130500211@st.sit.kmutt.ac.th</p>
        </div>

        {/* Course Detail */}
        <div className="border rounded-md p-4">
          <h3 className="font-semibold mb-2">Course Detail</h3>
          <p><strong>Course</strong><br />CSC498-CSC499[2026]</p>
        </div>
      </div>

      <div className="mt-8">
        <button className="px-4 py-2 bg-gradient-to-r from-red-500 to-black text-white rounded shadow hover:opacity-90">
          Log out
        </button>
      </div>
    </main>
  );
}
