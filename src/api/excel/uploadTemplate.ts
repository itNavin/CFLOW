import { Axios } from "@/util/AxiosInstance";
import { uploadTemplate } from "@/types/api/import";

export const uploadTemplateAPI = async (
  courseId: string,
  files: File[]
): Promise<uploadTemplate.UploadTemplatePayload> => {
  const formData = new FormData();
  if (files.length > 0) {
    formData.append("file", files[0]);
  }
  const response = await Axios.post<uploadTemplate.UploadTemplatePayload>(
    `/import/enroll/course/${courseId}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  console.log("courseId", courseId);
  console.log("response", response);
  return response.data;
}