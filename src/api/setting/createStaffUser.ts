import { Axios } from "@/util/AxiosInstance";
import { createStaffUser } from "@/types/api/setting";

export const createStaffUserAPI = async (
  email: string,
  name: string,
  program: "CS" | "DSI"
) => {
  const body = {
    email: email,
    name: name,
    program: program,
  };
  const response = await Axios.post<createStaffUser.createStaff>(
    "/user/create-staff",
    body
  );
  return response.data;
};
