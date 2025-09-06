import { getCourse } from "@/types/api/course";
import { Axios } from "@/util/AxiosInstance";

export const getCourseAPI = () => {
  return Axios.get<getCourse.Course>(`/course/my-courses`);
};
