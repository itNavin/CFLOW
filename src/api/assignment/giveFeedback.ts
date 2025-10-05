import { Axios } from "@/util/AxiosInstance";
import { giveFeedback } from "@/types/api/assignment";

export const giveFeedbackAPI = async (submissionId : string, comment: string, newDueDate: string, newStatus: string) =>{
    const body = {
        submissionId: submissionId,
        comment: comment,
        newDueDate: newDueDate,
        newStatus: newStatus
    }
    const response = await Axios.post<giveFeedback.GiveFeedbackPayload>("/feedback/create", body);
    return response.data;
}