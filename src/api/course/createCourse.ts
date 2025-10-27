import { Axios } from '@/util/AxiosInstance';
import { createCourse } from '@/types/api/course';

export const createCourseAPI = async (course: "CS" | "DSI", name: string, description: string | null) => {
  const body = {
    name,
    description: description ?? null,
    program: course,
  };

  try {
    const res = await Axios.post<createCourse.CreateCoursePayload>("/course/createCourse", body); 
    return res.data;
  } catch (err: any) {
    if (err?.response) throw err;
    const wrapped: any = new Error(err?.message ?? "Network error");
    wrapped.response = { status: 0, data: { message: err?.message ?? "Network error" } };
    throw wrapped;
  }
};