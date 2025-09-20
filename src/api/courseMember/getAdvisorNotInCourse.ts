import { getAdvisorNotInCourse } from "@/types/api/courseMember";
import { Axios } from "@/util/AxiosInstance";

export const getAdvisorNotInCourseAPI = (courseId: string) => {
  return Axios.get<getAdvisorNotInCourse.getAdvisorNotInCourse>(`/courseMember/advisorsNotInCourse/course/${courseId}`);
};