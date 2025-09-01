import { Announcement } from "@/types/api/announcement";
import { Axios } from "@/util/AxiosInstance";

export const createAnnouncementByCourseIdAPI = (courseId: number) => {
    return Axios.get<Announcement.Announcement[]>(`/announcement/course/${courseId}`);
}