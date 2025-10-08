import { Axios } from "@/util/AxiosInstance";
import { getStaffMember } from "@/types/api/courseMember";

export const getStaffMembersAPI = async (courseId: string) => {
    const response = await Axios.get<getStaffMember.StaffMember>(
        `/courseMember/staff/course/${courseId}`
    );
    return response.data;
}