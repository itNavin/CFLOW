import { getAllAssignments } from "@/types/api/assignment";
import { Axios } from "@/util/AxiosInstance";

export const getAssignmentWithSubmissionAPI = (assignmentId: number, groupId: number) => {
    const response = Axios.get<getAllAssignments.getAssignmentWithSubmission>(`/assignment/${assignmentId}/group/${groupId}`);
    return response;
} 