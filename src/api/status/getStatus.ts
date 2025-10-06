import { Axios } from "@/util/AxiosInstance";
import { status } from "@/types/api/status";

function buildQuery(params: Record<string, string | number | undefined | null>) {
  const query = Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`)
    .join("&");
  return query ? `?${query}` : "";
}

export async function getStatusAPI(
  courseId: string,
  options?: {
    assignmentId?: string;
    groupId?: string;
    status?: string;
  }
) {
  const query = buildQuery({
    assignmentId: options?.assignmentId,
    groupId: options?.groupId,
    status: options?.status,
  });
  const url = `/status/course/${courseId}${query}`;
  const response = await Axios.get<status.status>(url);
  return response.data;
}