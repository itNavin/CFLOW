import { Axios } from "@/util/AxiosInstance";
import { updateAssignment } from "@/types/api/assignment";

type UpdateDeliverablePayload = {
  name: string;
  allowedFileTypes: string[]; // match your backend key
};

export const updateAssignmentAPI = async (
  assignmentId: string,
  name: string,
  description: string,
  endDate: string,
  dueDate: string,
  schedule: string | null,
  deliverables: UpdateDeliverablePayload[], // will be sent as ONE JSON array
  keepUrls: string[], // will be sent as ONE JSON array
  files: File | null
) => {
  const form = new FormData();

  form.append("assignmentId", assignmentId);
  form.append("name", name);
  form.append("description", description);
  form.append("endDate", endDate);
  form.append("dueDate", dueDate);
  if (schedule) form.append("schedule", schedule);

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
