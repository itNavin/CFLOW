import { Axios } from "@/util/AxiosInstance";
import { updateCourse } from "@/types/api/course";

export const updateCourseAPI = async (courseId: string, name: string, description: string | null) => {
    const body = {
        courseId: courseId,
        name: name,
        description: description || null,
    }
    const response = await Axios.put<updateCourse.UpdateCoursePayload>("/course/updateCourseById", body);
    return response;
}   