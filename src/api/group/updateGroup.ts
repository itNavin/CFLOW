import { Axios } from "@/util/AxiosInstance";
import { updateGroup } from "@/types/api/group";

export const updateGroupAPI = async (
  courseId: string,
  groupId: string,
  codeNumber: string,
  projectName: string,
  productName: string | null,
  company: string | null,
  memberIds: { id: string; workRole: string | null }[],
  advisorIds: { id: string }[],
  coAdvisorIds: { id: string }[]
) => {
  const body = {
    courseId: courseId,
    groupId: groupId,
    codeNumber: codeNumber,
    projectName: projectName,
    productName: productName || null,
    company: company || null,
    memberIds: memberIds,
    advisorIds: advisorIds,
    coAdvisorIds: coAdvisorIds || null,
  };
  const response = await Axios.patch<updateGroup.UpdateGroupPayload>(
    `/group/updateGroup`,
    body
  );
  return response;
};
