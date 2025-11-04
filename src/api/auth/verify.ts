import { Axios } from "@/util/AxiosInstance"

export const VerifyAPI = async () => {
    const response = await Axios.get("/auth/verify");
    return response;
}