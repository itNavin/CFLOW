import { getStudentNotInCourse } from "@/types/api/courseMember";
import { Axios } from "@/util/AxiosInstance";

export const getStudentNotInCourseAPI = (courseId: string) => {
  return Axios.get<getStudentNotInCourse.getStudentNotInCourse[]>(`/courseMember/studentsNotInCourse/course/${courseId}`);
};