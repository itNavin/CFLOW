// src/api/announcement/updateAnnouncement.ts
import { updateAnnouncement } from "@/types/api/announcement";
import { Axios } from "@/util/AxiosInstance";

export type UpdateAnnouncementArgs = {
  announcementId: string;
  name: string;
  description: string;
  schedule?: string | null;
  keepUrls?: string[];
  files?: File;
};

export const updateAnnouncementAPI = async ({
  announcementId,
  name,
  description,
  schedule,
  keepUrls,
  files,
}: UpdateAnnouncementArgs) => {
  const form = new FormData();

  form.append("announcementId", announcementId);
  form.append("name", name);
  form.append("description", description);

  if (schedule) form.append("schedule", schedule);

  form.append("keepUrls", JSON.stringify(keepUrls ?? []));

  if (files) {
    form.append("files", files, files.name);
  }

  const res = await Axios.put<updateAnnouncement.Response>(
    "/announcement/update",
    form,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
};
