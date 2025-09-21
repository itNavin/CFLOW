import { Axios } from "@/util/AxiosInstance";
import { submission } from "@/types/api/submission";
import { uploadSubmissionFile } from "@/types/api/file";

export const createSubmissionAPI = async (
  courseId: string,
  assignmentId: string,
  comment: string
) => {
  const body = {
    comment: comment,
  };
  const response = Axios.post<submission.Submission>(
    `/submission/course/${courseId}/assignment/${assignmentId}`,
    body
  );
  return response;
};

export const uploadSubmissionFileAPI = async (
  courseId: string,
  assignmentId: string,
  deliverableId: string,
  groupId: string,
  submissionId: string,
  file: File
): Promise<uploadSubmissionFile.UploadSubmissionFilePayload> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response =
      await Axios.post<uploadSubmissionFile.UploadSubmissionFilePayload>(
        `/storage/upload/submission/course/${courseId}?assignmentId=${assignmentId}&deliverableId=${deliverableId}&groupId=${groupId}&submissionId=${submissionId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    return response.data;
  } catch (error) {
    throw error;
  }
};
