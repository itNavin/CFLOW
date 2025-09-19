import { Axios } from "@/util/AxiosInstance"
import { deleteCourse } from "@/types/api/course"

export const deleteCourseAPI = async (courseId: string) => {
    const body = {
        courseId: courseId
    };
    const response = Axios.delete<deleteCourse.DeleteCoursePayload>("/course/delete", {data: body});
    return response;
}