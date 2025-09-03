import { File } from "@/types/api/file";
import { Axios } from "@/util/AxiosInstance";

export const createFileByCourseIdAPI = (courseId: number) => {
    return Axios.post<File.File[]>(`/file/create/course/${courseId}`);
}