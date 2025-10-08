import { Axios } from "@/util/AxiosInstance";
import { getStaffNotInCourse } from "@/types/api/courseMember";

export const getStaffNotInCourseAPI = async (courseId: string) => {
    const response = await Axios.get<getStaffNotInCourse.getStaffNotInCourse>(
        `/courseMember/staffNotInCourse/course/${courseId}`
    );
    return response.data;
}