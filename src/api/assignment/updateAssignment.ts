import { Axios } from "@/util/AxiosInstance";
import { updateAnnouncement } from "@/types/api/announcement";

type UpdateDeliverablePayload = {
    name : string,
    allowedFileType : string[],
}

export const updateAssignmentAPI = async (assignmentId: string,name: string, description: string, endDate: string, schedule: string | null,deliverables: UpdateDeliverablePayload[]) => {
    const body = {
        assignmentId: assignmentId,
        name: name,
        description: description,
        endDate: endDate,
        schedule: schedule,
        deliverables: deliverables
    }

    const response = await Axios.put<updateAnnouncement.Response>(
        `/assignment/update`,
        body
    );
    return response.data;
}