import {getGroup} from "@/types/api/group";
import { Axios } from "@/util/AxiosInstance";

export const getAllGroupAPI = async (courseId: string) => {
  return Axios.get<getGroup.getAllGroup>(`/group/course/${courseId}`);
};
