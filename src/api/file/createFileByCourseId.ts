import { File } from "@/types/api/file";
import { Axios } from "@/util/AxiosInstance";

export const createFileByCourseIdAPI = (courseId: number) => {
    return Axios.get<File.File[]>(`/file/create/course/${courseId}`);
}