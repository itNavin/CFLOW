import { updateUserStatus } from "@/types/api/setting";
import { Axios } from "@/util/AxiosInstance";

export const updateUserStatusApi = async (id: string[], status: "ACTIVE" | "RESIGNED" | "RETIRED" | "GRADUATED") => {
  const body = {
    targetUserId: id,
    status: status,
  };
  const response = await Axios.post<updateUserStatus.updateUserStatus>(
    `/user/update-user-status`,
    body
  );
  return response.data;
};
