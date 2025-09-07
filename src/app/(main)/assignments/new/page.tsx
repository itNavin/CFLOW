"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AssignmentModal, { AssignmentPayload } from "@/components/assignmentModal";

export default function NewAssignmentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = searchParams.get("courseId");

  const handleSubmit = async (data: AssignmentPayload) => {
    // Handle assignment creation with courseId
    console.log("Creating assignment for course:", courseId, data);
    // Add your API call here
    // Example: await createAssignment(courseId, data);
    
    // Navigate back after successful creation
    router.back();
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <AssignmentModal
      open={true}
      onClose={handleClose}
      onSubmit={handleSubmit}
    />
  );
}