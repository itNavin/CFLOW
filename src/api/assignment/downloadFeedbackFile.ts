import { Axios } from "@/util/AxiosInstance";
import { downloadFeedbackFile } from "@/types/api/assignment";

export const downloadFeedbackFileAPI = async (feedbackFileId: string) => {
    return await Axios.get<downloadFeedbackFile.Response>(`/download/feedback/${feedbackFileId}`);
}