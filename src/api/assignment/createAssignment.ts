import { createAssignment } from "@/types/api/assignment";
import { Axios } from "@/util/AxiosInstance";

export type CreateAssignmentPayload = {
  courseId: string;
  name: string;
  description: string;
  endDate: string;
  schedule: string;
  dueDate: string;
  deliverables: {
    name: string;
    allowedFileTypes: string[];
  }[];
};

export const createAssignmentAPI = async (payload: CreateAssignmentPayload) => {
  const response = await Axios.post<createAssignment.CreateAssignmentResponse>("/assignment/create", payload);
  return response.data;
};