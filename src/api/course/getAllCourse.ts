// src/api/course/getAllCourse.ts
import { getAllCourse } from '@/types/api/course';
import { Axios } from '@/util/AxiosInstance';

export const getAllCourseAPI = () => {
  return Axios.get<getAllCourse.AllCourse>("/course/getAllCourse");
};
