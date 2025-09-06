import { getAdvisorNotInCourse } from "@/types/api/courseMember";
import { Axios } from "@/util/AxiosInstance";

export const getAdvisorNotInCourseAPI = (courseId: number) => {
  return Axios.get<getAdvisorNotInCourse.getAdvisorNotInCourse[]>(`/courseMember/advisorsNotInCourse/course/${courseId}`);
};