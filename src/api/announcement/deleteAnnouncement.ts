import { Axios } from "@/util/AxiosInstance";
import { deleteAnnouncement } from "@/types/api/announcement";

export const deleteAnnouncementAPI = async (announcementId: string) => {
  const body = { announcementId: announcementId };
  const response = await Axios.delete<deleteAnnouncement.Response>(
    `/announcement/delete`,
    { data: body }
  );
  return response.data;
};
