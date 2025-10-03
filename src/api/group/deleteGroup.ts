import { Axios } from "@/util/AxiosInstance";
import { deleteGroup } from "@/types/api/group";

export const deleteGroupAPI = async (groupId : string) => {
    const body = {
        groupId: groupId,
    }
    const response = await Axios.delete<deleteGroup.DeleteGroupPayload>("/group/deleteGroup", { data: body });
    return response.data;
}