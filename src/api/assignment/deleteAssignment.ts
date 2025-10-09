import { deleteAssignment } from "@/types/api/assignment";
import { Axios } from "@/util/AxiosInstance";

export const deleteAssignmentAPI = async (assignmentId: string) => {
  const body = { assignmentId };
  const response = await Axios.delete<deleteAssignment.DeleteAssignmentPayload>(
    "/assignment/delete",
    { data: body }
  );
  return response.data;
};
