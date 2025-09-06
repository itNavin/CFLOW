import { getAllAssignments } from "@/types/api/assignment";
import { Axios } from "@/util/AxiosInstance";

export const getGroupByLecturerAPI = (courseId: number) => {
    const response = Axios.get<getAllAssignments.getGroupByLecturer>(`/assignment/course/${courseId}/groupAdvisor`);
    return response;
}