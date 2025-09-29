import { File } from "@/types/api/file";
import { Axios } from "@/util/AxiosInstance";

export const getAllFileByCourseIdAPI = (courseId: string) => {
    return Axios.get<File.Files[]>(`/file/course/${courseId}`);
}