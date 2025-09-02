import {getGroup} from "@/types/api/group";
import { Axios } from "@/util/AxiosInstance";

export const getAllGroupAPI = async (courseId: number) => {
  return Axios.get<getGroup.GroupList>(`/group/course/${courseId}`);
};
