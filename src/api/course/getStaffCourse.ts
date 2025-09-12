// src/api/course/getAllCourse.ts
import { getStaffCourse } from '@/types/api/course';
import { Axios } from '@/util/AxiosInstance';

export const getStaffCourseAPI = () => {
  return Axios.get<getStaffCourse.StaffCourse>("/course/getStaffCourse");
};
