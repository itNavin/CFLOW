import { Dashboard } from "@/types/api/dashboard";
import { Axios } from "@/util/AxiosInstance";

export const getGroupInformation = (courseId: string) => {
    return Axios.get<Dashboard.studentInfo[]>(`/dashboard/group-information/course/${courseId}`);
};