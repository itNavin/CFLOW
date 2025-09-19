import { createAnnouncement, file } from "@/types/api/announcement";
import { Axios } from "@/util/AxiosInstance";

export const createAnnouncementByCourseIdAPI = (courseId: string, name:string, description: string, schedule:string | null) => {
    const body = {
        name: name,
        description: description,
        schedule: schedule
    }
    const response = Axios.post<createAnnouncement.createAnnouncementPayload>(`/announcement/course/${courseId}`, body);
    return response;
}