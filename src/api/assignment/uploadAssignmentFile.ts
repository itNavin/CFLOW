import { Axios } from "@/util/AxiosInstance";
import { uploadAssignmentFile } from "@/types/api/storage";

export const uploadAssignmentFileAPI = async (
  courseId: string,
  assignmentId: string,
  file: File
): Promise<uploadAssignmentFile.uploadAssignmentFileResponse> => {
  const formData = new FormData();
  formData.append("courseId", courseId);
  formData.append("assignmentId", assignmentId);
  formData.append("file", file);

  const response = await Axios.post<uploadAssignmentFile.uploadAssignmentFileResponse>(
    "/storage/upload/assignment",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};