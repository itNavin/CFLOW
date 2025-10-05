import { Axios } from "@/util/AxiosInstance";
import { uploadFeedbackFile } from "@/types/api/assignment";

export const uploadFeedbackFileAPI = async (
  file: File,
  deliverableId: string,
  groupId: string,
  feedbackId: string
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("deliverableId", deliverableId);
  formData.append("groupId", groupId);
  formData.append("feedbackId", feedbackId);

  return Axios.post<uploadFeedbackFile.UploadFeedbackFilePayload>("/storage/upload/feedback", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};