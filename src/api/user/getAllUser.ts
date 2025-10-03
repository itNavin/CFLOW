import { Axios } from "@/util/AxiosInstance";
import type { getAllUsers } from "@/types/api/user";

export const getAllUsersAPI = async (): Promise<getAllUsers.Response> => {
  const res = await Axios.get("/user/all-users");
  const data = res.data;
  if (Array.isArray(data)) {
    return { users: data };
  }
  return data; 
};
