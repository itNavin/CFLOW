import { Axios } from "@/util/AxiosInstance";
import { createLecturerUser } from "@/types/api/setting";

export const createLecturerUserAPI = async (
  email: string,
  name: string,
  program: "CS" | "DSI"
) => {
  const body = {
    email: email,
    name: name,
    program: program,
  };
  const response = await Axios.post<createLecturerUser.createLecturer>(
    "/user/create-lecturer",
    body
  );
  return response.data;
};
