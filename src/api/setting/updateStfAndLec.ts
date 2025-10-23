import { updateStfAndLec } from "@/types/api/setting";
import { Axios } from "@/util/AxiosInstance";

export const updateStfAndLecApi = async (
  id: string,
  name: string,
  email: string
) => {
  const body = {
    id: id,
    name: name,
    email: email,
  };
  const response = await Axios.post<updateStfAndLec.updateStfAndLec>(
    `/user/update-staff-lecturer`,
    body
  );
  return response.data;
};
