import { Axios } from '@/util/AxiosInstance';
import { createCourse } from '@/types/api/course';

export const createCourseAPI = async (course: "CS"|"DSI", name: string, description:string | null) => {
  const body = {
    name: name,
    description: description || null,
    program: course,
  };
  const response = Axios.post<createCourse.CreateCoursePayload>("/course/createCourse", body);
  return response;
};
