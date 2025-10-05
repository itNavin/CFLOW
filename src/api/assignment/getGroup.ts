import { Axios } from "@/util/AxiosInstance";
import { getGroups } from "@/types/api/assignment";

export const getGroupAPI = async (courseId: string) => {
    const response = await Axios.get<getGroups.groups>(`/assignment/getGroupByLecturerId/course/${courseId}`);
    return response.data;
};
