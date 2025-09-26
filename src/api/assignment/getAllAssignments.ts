import { getAllAssignments } from "@/types/api/assignment";
import { Axios } from "@/util/AxiosInstance";

export const getAllAssignmentsAPI = (courseId: string) => {
    const response = Axios.get<getAllAssignments.getAllAssignments>(`/assignment/getAllAssignments/course/${courseId}`);
    return response;
}

export const getAssignmentByOpenTaskandSubmittedAPI = (courseId: string, groupId: string) => {
    const response = Axios.get<getAllAssignments.AssignmentbyOpenTaskandSubmitted>(`/assignment/course/${courseId}/group/${groupId}/summary`);
    return response;
}