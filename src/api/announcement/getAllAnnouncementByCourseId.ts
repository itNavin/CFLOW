import { Announcement } from "@/types/api/announcement";
import { Axios } from "@/util/AxiosInstance";

export const getAllAnnouncementByCourseIdAPI = (courseId: string) => {
    return Axios.get<Announcement.Announcement>(`/announcement/course/${courseId}`);
}