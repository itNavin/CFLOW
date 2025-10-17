"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AssignmentModal from "@/components/assignment/AssignmentModal";
import { createAssignmentAPI, CreateAssignmentPayload } from "@/api/assignment/createAssignment";

export const dynamic = "force-dynamic";

function NewAssignmentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = searchParams.get("courseId") ?? "";

  // Convert modal data to API payload
  const buildPayload = (data: any): CreateAssignmentPayload => ({
    courseId,
    name: data.title,
    description: data.descriptionHtml,
    endDate: data.endAt ?? "",
    schedule: data.scheduleAt ?? "",
    dueDate: data.dueAt ?? "",
    deliverables: data.deliverables.map((d: any) => ({
      name: d.name,
      allowedFileTypes: d.requiredTypes.map((typeStr: string) =>
        typeStr === "PDF" ? "pdf"
        : typeStr === "Word Document" ? "docx"
        : typeStr.toLowerCase()
      ),
    })),
  });

  const handleSubmit = async (data: any) => {
    // LOG 1: Data received from modal
    console.log("Parent received data from modal:", data);

    try {
      // LOG 2: Payload built for API
      const payload = buildPayload(data);
      console.log("API payload to backend:", payload);

      // LOG 3: API response
      const response = await createAssignmentAPI(payload);
      console.log("API response:", response);

      router.back();
    } catch (error) {
      // LOG 4: Error if API call fails
      console.error("Failed to create assignment:", error);
    }
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

export default function NewAssignmentPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center p-6">Loading assignment form...</div>}>
      <NewAssignmentContent />
    </Suspense>
  );
}
