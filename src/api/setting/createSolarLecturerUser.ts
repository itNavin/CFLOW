import { Axios } from "@/util/AxiosInstance";
import { createSolarLecturerUser } from "@/types/api/setting";

export const createSolarLecturerUserAPI = async (email: string, name: string, program: "CS" | "DSI") => {
  const body = {
    email: email,
    name: name,
    program: program,
  }
  return await Axios.post<createSolarLecturerUser.createSolarLecturer>("/user/create-solar-lecturer", body);
};