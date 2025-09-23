import { Axios } from "@/util/AxiosInstance";
import { studentNotInGroup } from "@/types/api/group";

export const getStudentNotInGroupAPI = (courseId: string) => {
    return Axios.get<studentNotInGroup.StudentNotInGroup>(`/group/studentsNotInGroup/course/${courseId}`);
};