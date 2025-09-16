import { myProject } from "@/types/api/myProject";
import { Axios } from "@/util/AxiosInstance";

export const getMyProjectByCourseAPI = (courseId: string) => {
    return Axios.get<myProject.MyProject>(`/user/my-project/course/${courseId}`);
}