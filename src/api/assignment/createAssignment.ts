import { Axios } from "@/util/AxiosInstance";
import { createAssignment } from "@/types/api/assignment";

type deliverable ={
    name: string;
    type: string[];
}

export const createAssignmentAPI = async (courseId: string, name:string, description:string, endDate:string, schedule:string, assignmentDueDates:string, deliverables:deliverable[]) => {
    const body = {
        courseId: courseId,
        name: name,
        description: description,
        endDate: endDate,
        schedule: schedule,
        dueDate: assignmentDueDates,
        deliverables: deliverables,
    };

    console.log("Sending to API:", body);
    const response = Axios.post<createAssignment.CreateAssignmentResponse>(`/assignment/create`, body);
    console.log("API Response:", response);
    return response
}; 