import { Axios } from "@/util/AxiosInstance";
import { createGroup } from "@/types/api/group";

export const createGroupAPI = async (
  courseId: string,
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
    codeNumber: codeNumber,
    projectName: projectName,
    productName: productName || null,
    company: company || null,
    memberIds: memberIds,
    advisorIds: advisorIds,
    coAdvisorIds: coAdvisorIds,
  };
  const response = Axios.post<createGroup.CreateGroupPayload>(
    "/group/createGroup",
    body
  );
  return response;
};
