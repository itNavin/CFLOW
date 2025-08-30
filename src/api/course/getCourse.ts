import {getCourse } from '@/types/api/course';
import { Axios } from '@/util/AxiosInstance';
export const getCourseAPI = (id:number, email:string, name:string, surname:string, role: "ADVISOR" | "STUDENT" | "ADMIN" | "SUPER_ADMIN" ) => {
    const response = Axios.get<getCourse.Course>("/course/my-courses");
    return response;
}