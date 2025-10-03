import { Axios } from "@/util/AxiosInstance";
import { deleteCourseFile } from "@/types/api/file";

export const deleteCourseFileAPI = async (fileId: string) => {
    const body = {
        fileId: fileId,
    }
    const response = await Axios.delete<deleteCourseFile.DeleteCourseFilePayload>("/file/deleteFile", { data: body });
    return response.data;
};
