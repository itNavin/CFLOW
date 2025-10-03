import { Axios } from "@/util/AxiosInstance";
import { assignmentDetail } from "@/types/api/assignment";

export const getStdAssignmentDetailAPI = (courseId: string, assignmentId: string) => {
  return Axios.get<assignmentDetail.AssignmentStudentDetail>(
    `/assignment/getSubmissionDetail/course/${courseId}/assignment/${assignmentId}`
  );
};
