import { uploadCourseFile } from "@/types/api/storage";
import { Axios } from "@/util/AxiosInstance";

export const uploadCourseFileAPI = async (
  courseId: string,
  files: File[]
): Promise<uploadCourseFile.uploadCourseFilePayload[]> => {
  const promisesUpload = files.map(async (file, _) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await Axios.post<uploadCourseFile.uploadCourseFilePayload>(
      `/storage/upload/course/${courseId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  });

  const results = await Promise.all(promisesUpload);
  return results;
};
