import { Announcement } from "@/types/api/announcement";
import { Axios } from "@/util/AxiosInstance";

export const createAnnouncementByCourseIdAPI = (courseId: number) => {
    return Axios.post<Announcement.Announcement[]>(`/announcement/course/${courseId}`);
}