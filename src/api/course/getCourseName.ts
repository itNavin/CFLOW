import { getCoursename } from "@/types/api/course";
import { Axios } from "@/util/AxiosInstance";

export const getCourseNameAPI = (courseId: number) => {
  return Axios.get<getCoursename.CourseName>(`/course/course/${courseId}`);
}