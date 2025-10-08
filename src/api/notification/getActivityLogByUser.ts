import { Axios } from "@/util/AxiosInstance";
import { notification } from "@/types/api/notification";

export const getActivityLogByUserAPI = async () => {
    const response = await Axios.get<notification.Notification>(
        `/activity/user`
    );
    return response.data;
}
