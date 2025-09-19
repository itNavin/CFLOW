import { File } from "@/types/api/file";
import { Axios } from "@/util/AxiosInstance";

export const createFileByCourseIdAPI = (courseId: string) => {
    return Axios.post<File.File[]>(`/file/create/course/${courseId}`);
}