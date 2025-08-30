import { AuthPayload } from "@/types/api/auth";
import { Axios } from "@/util/AxiosInstance";

export const LoginAPI = async (email: string, password: string) => {
  const body = {
    email: email,
    passwordHash: password,
  };
  const response = Axios.post<AuthPayload.Login>("/login", body);

  return response
};
