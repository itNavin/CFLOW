import { getAdvisorMember } from "@/types/api/courseMember";
import { Axios } from "@/util/AxiosInstance";

export const getAdvisorMemberAPI = (courseId: number) => {
  return Axios.get<getAdvisorMember.AdvisorMember>(`/courseMember/advisors/course/${courseId}`);
};
