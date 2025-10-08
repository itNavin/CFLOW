import { Axios } from "@/util/AxiosInstance";
import { fetchStudentData } from "@/types/api/setting";

export const fetchStudentDataAPI = async (academicYear: string) => {
    const response = await Axios.get<fetchStudentData.fetchStudent>(`/user/fetchStudentData?academicYear=${academicYear}`);
    return response.data;
}