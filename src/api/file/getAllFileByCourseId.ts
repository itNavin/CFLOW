import { File } from "@/types/api/file";
import { Axios } from "@/util/AxiosInstance";

export const getAllFileByCourseIdAPI = (courseId: number) => {
    return Axios.get<File.File[]>(`/file/course/${courseId}`);
}