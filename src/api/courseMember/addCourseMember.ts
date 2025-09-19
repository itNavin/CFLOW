import { Axios } from "@/util/AxiosInstance";
import { addCourseMember } from "@/types/api/courseMember";

export const addCourseMemberAPI = async (
  courseId: string,
  userIds: string[]
) => {
  const body = { userIds, courseId };
  const response = await Axios.post(
    `/courseMember/addMember`,
    body
  );
  return response;
};
