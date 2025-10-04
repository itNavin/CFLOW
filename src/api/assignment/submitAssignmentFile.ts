import { Axios } from "@/util/AxiosInstance";
import { submitAssignmentWithFile } from "@/types/api/assignment";

export const submitAssignmentFileAPI = async (
  submissionId: string,
  file: File,
  deliverableId: string,
): Promise<submitAssignmentWithFile.SubmitAssignmentWithFilePayload> => {
  const formData = new FormData();
    formData.append("file", file);
    formData.append("submissionId", submissionId);
    formData.append("deliverableId", deliverableId);
    const response = await Axios.post<submitAssignmentWithFile.SubmitAssignmentWithFilePayload>(
      `/storage/upload/submission`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
};
