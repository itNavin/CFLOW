import { myProject } from "@/types/api/myProject";
import { Axios } from "@/util/AxiosInstance";

export const getMyProjectByCourseAPI = (courseId: number) => {
    return Axios.get<myProject.MyProject>(`/myProject/course/${courseId}`);
}