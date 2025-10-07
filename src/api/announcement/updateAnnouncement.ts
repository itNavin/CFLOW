import { updateAnnouncement } from "@/types/api/announcement";
import { Axios } from "@/util/AxiosInstance";

export const updateAnnouncementAPI = async (
  announcementId: string,
  name: string,
  description: string,
  schedule: string | null
) => {
  const body = {
    announcementId: announcementId,
    name: name,
    description: description,
    schedule: schedule,
  };
  const response = await Axios.put<updateAnnouncement.Response>(
    `/announcement/update`,
    body
  );
  return response.data;
};
