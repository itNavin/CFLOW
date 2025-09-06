import { Dashboard } from "@/types/api/dashboard";
import { Axios } from "@/util/AxiosInstance";

type DashboardQuery = {
    assignmentId?: number | undefined;
    groupId?: number | undefined;
}

export const getDashboardData =async  (courseId:number, query?: DashboardQuery) => {
    const url = `/dashboard/course/${courseId}`
    let urlWithQuery = url;
    if (query && (query.assignmentId || query.groupId)) {
        const params = new URLSearchParams();
        if (query.assignmentId !== undefined) {
            params.append('assignmentId', query.assignmentId.toString());
        }
        if (query.groupId !== undefined) {
            params.append('groupId', query.groupId.toString());
        }
        urlWithQuery += `?${params.toString()}`;
    }
    const response = await Axios.get<Dashboard.Dashboard>(urlWithQuery);
    return response;
};