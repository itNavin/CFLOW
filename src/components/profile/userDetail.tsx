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
        console.log("Profile raw response:", response.data);
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

  if (error) {
    return (
      <div className="border rounded-md p-4">
        <h3 className="font-semibold mb-2">User Detail</h3>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // ✅ If no profile in system
  if (!profileData) {
    return (
      <div className="border rounded-md p-4">
        <h3 className="font-semibold mb-2">User Detail</h3>
        <p className="text-gray-500">You don’t have the data in system</p>
      </div>
    );
  }

  // Optional: local var for cleaner JSX
  const user = profileData.profile?.user;

  return (
    <div className="border rounded-md p-4">
      <h3 className="text-xl font-semibold mb-2">User Detail</h3>
      <p className="text-lg"><strong>Name</strong><br />{user?.name ?? "-"}</p>
      <p className="text-lg mt-2"><strong>Email</strong><br />{user?.email ?? "-"}</p>
      <p className="text-lg mt-2"><strong>Username</strong><br />{user?.id ?? "-"}</p>
      <p className="text-lg mt-2"><strong>Role</strong><br />{user?.role ?? "-"}</p>
      {user?.program && (
        <p className="text-lg mt-2"><strong>Program</strong><br />{user.program}</p>
      )}
    </div>
  );
}
