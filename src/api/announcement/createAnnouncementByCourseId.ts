import { createAnnouncement, file } from "@/types/api/announcement";
import { Axios } from "@/util/AxiosInstance";

export const createAnnouncementByCourseIdAPI = (courseId: string, name:string, description: string, schedule:string | null) => {
    const body = {
        name: name,
        description: description,
        schedule: schedule,
        courseId: courseId
    }
    const response = Axios.post<createAnnouncement.Response>(`/announcement/course`, body);
    return response;
}