import { Axios } from "@/util/AxiosInstance"
import { getProfile } from "@/types/api/profile"

export const getProfileAPI = () => {
    return Axios.get<getProfile.Profile>(`/profile/getProfile`)
}