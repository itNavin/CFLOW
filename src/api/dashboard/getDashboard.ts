import { Dashboard } from "@/types/api/dashboard";
import { Axios } from "@/util/AxiosInstance";

export const getDashboardData= (courseId:number) => {
    return Axios.get<Dashboard.Dashboard>(`/dashboard/course/${courseId}`);
};
