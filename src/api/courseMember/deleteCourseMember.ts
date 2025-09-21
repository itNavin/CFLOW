import { Axios } from "@/util/AxiosInstance";
import { deleteCourseMember } from "@/types/api/courseMember";

export const deleteCourseMemberAPI = async (courseMemberId: string | string[]) => {
  const idsArray = Array.isArray(courseMemberId)
    ? courseMemberId
    : [courseMemberId];
  const body = { courseMemberIds: idsArray };
  const response = Axios.delete<deleteCourseMember.DeleteCourseMemberPayload>(
    "/courseMember/deleteMembers",
    { data: body }
  );
  return response;
};
