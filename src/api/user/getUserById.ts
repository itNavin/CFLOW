import { Axios } from "@/util/AxiosInstance"
import { User } from "@/types/api/user";

export const getUserById = async (userId: number) => {
    return Axios.get<User.User>(`/users/${userId}`);
}
