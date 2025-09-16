import React, { useEffect, useState } from "react";
import { getProfileAPI } from "@/api/profile/getProfile";
import { getProfile } from "@/types/api/profile";

export default function UserDetailCard() {
  const [profileData, setProfileData] = useState<getProfile.Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getProfileAPI();
        console.log("Profile data:", response.data);
        setProfileData(response.data);
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="border rounded-md p-4">
        <h3 className="font-semibold mb-2">User Detail</h3>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="border rounded-md p-4">
        <h3 className="font-semibold mb-2">User Detail</h3>
        <p className="text-red-500">{error || "No data available"}</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md p-4">
      <h3 className="font-semibold mb-2">User Detail</h3>
      <p><strong>Name</strong><br />{profileData.profile.user.name}</p>
      <p className="mt-2"><strong>Email</strong><br />{profileData.profile.user.email}</p>
      <p className="mt-2"><strong>Username</strong><br />{profileData.profile.user.id}</p>
      <p className="mt-2"><strong>Role</strong><br />{profileData.profile.user.role}</p>
      {profileData.profile.user.program && (
        <p className="mt-2"><strong>Program</strong><br />{profileData.profile.user.program}</p>
      )}
    </div>
  );
}