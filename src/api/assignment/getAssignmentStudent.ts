import { getAllAssignments } from "@/types/api/assignment";
import { Axios } from "@/util/AxiosInstance";

export const getStudentAssignmentAPI = (courseId: string) => {
    const response = Axios.get<getAllAssignments.getStudentAssignments>(`/assignment/getStudentAssignmentByGroupId/course/${courseId}`);
    return response;
} 