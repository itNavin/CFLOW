import { Axios } from "@/util/AxiosInstance";
import { addCourseMember } from "@/types/api/courseMember";

export const addCourseMemberAPI = async (
  courseId: number,
  userIds: number[]
) => {
  const body = { userIds };
  const response = await Axios.post(
    `/courseMember/members/course/${courseId}`,
    body
  );
  return response;
};
