import { Axios } from "@/util/AxiosInstance";
import { downloadCourseFile } from "@/types/api/file";

export const downloadCourseFileAPI = (fileId: string) => {
  return Axios.get<downloadCourseFile.DownloadCourseFilePayload>(`/download/file/${fileId}`);
}