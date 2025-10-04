import { Axios } from "@/util/AxiosInstance";
import { submitAssignment } from "@/types/api/assignment";

export const submitAssignmentAPI = async (assignmentId : string, comment: string) =>{
    const body = {
        assignmentId: assignmentId,
        comment: comment
    }
    const response = await Axios.post<submitAssignment.SubmitAssignmentPayload>("/submission/create", body);
    return response.data;
};
