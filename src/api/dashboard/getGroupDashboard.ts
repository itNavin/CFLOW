import { Dashboard } from "@/types/api/dashboard";
import { Axios } from "@/util/AxiosInstance";

export const getGroupData = (courseId: string, groupId: string) => {
    return Axios.get<Dashboard.Dashboard>(`/dashboard/course/${courseId}?groupId=${groupId}`);
}