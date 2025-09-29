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
    formData.append("courseId", courseId);
    formData.append("announcementId", announcementId);
    const response =
      await Axios.post<uploadCourseFile.uploadCourseFileResponse>(
        `/storage/upload/file`,
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
