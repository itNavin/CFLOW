import { Axios } from "@/util/AxiosInstance";
import { updateAssignment } from "@/types/api/assignment";

type UpdateDeliverablePayload = {
  name: string;
  allowedFileTypes: string[]; // match your backend key
};

export const updateAssignmentAPI = async (
  assignmentId: string,
  name: string,
  description?: string | null,
  endDate?: string,
  dueDate?: string,
  schedule?: string | null,
  deliverables?: UpdateDeliverablePayload[], 
  keepUrls?: string[],
  files?: File | null
) => {
  const form = new FormData();

  form.append("assignmentId", assignmentId);
  form.append("name", name);
  if (typeof description !== "undefined") {
    form.append("description", description === null ? "null" : description);
  }
  if (typeof endDate !== "undefined") form.append("endDate", endDate ?? "");
  if (typeof dueDate !== "undefined") form.append("dueDate", dueDate ?? "");
  if (typeof schedule !== "undefined" && schedule !== null) form.append("schedule", schedule);

  form.append("deliverables", JSON.stringify(deliverables));
  if (keepUrls) form.append("keepUrls", JSON.stringify(keepUrls));

  if (files) {
    if (Array.isArray(files)) {
      files.forEach((file) => form.append("files", file, file.name));
    } else {
      form.append("files", files, files.name);
    }
  }

  const res = await Axios.put<updateAssignment.UpdateAssignmentResponse>(
    "/assignment/update",
    form,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data;
};
