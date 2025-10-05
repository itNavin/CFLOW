import { Axios } from "@/util/AxiosInstance";
import { assignmentDetail } from "@/types/api/assignment";

export const getLecStfAssignmentDetailAPI = (courseId: string, assignmentId: string, groupId: string) => {
  return Axios.get<assignmentDetail.AssignmentLecStfDetail>(
    `/assignment/getSubmissionDetail/course/${courseId}/assignment/${assignmentId}/group/${groupId}`
  );
}