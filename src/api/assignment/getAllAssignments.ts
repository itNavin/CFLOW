import { getAllAssignments } from "@/types/api/assignment";
import { Axios } from "@/util/AxiosInstance";

// export const getAllAssignmentsAPI = (courseId: number) => {
//     const response = Axios.get<getAllAssignments.Assignment[]>(`/assignment/course/${courseId}`);
//     return response;
// }

export const getAssignmentByOpenTaskandSubmittedAPI = (courseId: number, groupId: number) => {
    const response = Axios.get<getAllAssignments.AssignmentbyOpenTaskandSubmitted>(`/assignment/course/${courseId}/group/${groupId}/summary`);
    return response;
}