import { AuthPayload } from "@/types/api/auth";
import { Axios } from "@/util/AxiosInstance";

export const LoginAPI = async (email: string, password: string) => {
  const body = {
    username: email,
    password: password,
  };
  const response = Axios.post<AuthPayload.Login>("/auth/login", body);

  return response;
};
