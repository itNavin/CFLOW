import { getCoursename } from "@/types/api/course";
import { Axios } from "@/util/AxiosInstance";

export const getCourseNameAPI = (courseId: string) => {
  return Axios.get<getCoursename.CourseName>(`/course/course/${courseId}`);
}