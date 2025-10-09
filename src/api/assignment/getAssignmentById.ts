import { Axios } from "@/util/AxiosInstance";
import { getAssignmentById } from "@/types/api/assignment";

export const getAssignmentByIdAPI = async (assignmentId: string) => {
  const response = await Axios.get<getAssignmentById.Response>(
    `/assignment/get/${assignmentId}`
  );
  return response.data;
}