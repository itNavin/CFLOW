import { Dashboard } from "@/types/api/dashboard";
import { Axios } from "@/util/AxiosInstance";

export const getGroupData = (courseId: number, groupId: number) => {
    return Axios.get<Dashboard.Dashboard>(`/dashboard/course/${courseId}?groupId=${groupId}`);
}