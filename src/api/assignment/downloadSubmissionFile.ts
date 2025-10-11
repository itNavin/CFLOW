import { downloadSubmissionFile } from "@/types/api/assignment";
import { Axios } from "@/util/AxiosInstance";

export const downloadSubmissionFileAPI = async (submissionFileId: string) => {
    return await Axios.get<downloadSubmissionFile.Response>(`/download/submission/${submissionFileId}?mode=download`);
}