import { uploadCourseFile } from "@/types/api/storage";
import { Axios } from "@/util/AxiosInstance";

export const uploadAnnouncementFileAPI = async (
  courseId: string,
  announcementId: string,
  files: File[]
): Promise<uploadCourseFile.uploadCourseFileResponse[]> => {
  const promisesUpload = files.map(async (file, _) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await Axios.post<uploadCourseFile.uploadCourseFileResponse>(
      `/storage/upload/course/${courseId}?announcementId=${announcementId}`,
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
