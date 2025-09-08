import { getAllAssignments } from "@/types/api/assignment";
import { Axios } from "@/util/AxiosInstance";

export const getAssignmentWithSubmissionAPI = (courseId: number, assignmentId: number) => {
    const response = Axios.get<getAllAssignments.getAssignmentWithSubmission>(`/assignment/course/${courseId}/assignment/${assignmentId}`);
    return response;
} 