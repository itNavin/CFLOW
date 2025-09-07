import { Axios } from "@/util/AxiosInstance";
import { createAssignment } from "@/types/api/assignment";

export const createAssignmentAPI = async (courseId: string, name:string, description:string, endDate:string, schedule:string, assignmentDueDates:createAssignment.CreateAssignmentDueDatePayload[], deliverables:createAssignment.CreateDeliverablePayload[]) => {
    const body = {
        name: name,
        description: description,
        endDate: endDate,
        schedule: schedule,
        dueDate: assignmentDueDates[0].dueDate,
        deliverables: deliverables,
    };

    console.log("Sending to API:", body);
    const response = Axios.post<createAssignment.CreateAssignmentPayload>(`/assignment/create/course/${courseId}`, body);
    console.log("API Response:", response);
    return response
}; 