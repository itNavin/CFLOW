import { getStudentMember } from "@/types/api/courseMember";
import { Axios } from "@/util/AxiosInstance";

export const getStudentMemberAPI = (courseId: string) => {
  return Axios.get<getStudentMember.StudentMember>(`/courseMember/students/course/${courseId}`);
};
