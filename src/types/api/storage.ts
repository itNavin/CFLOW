export namespace uploadCourseFile {
  export type uploadCourseFilePayload = {
    id: number;
    name: string;
    filepath: string;
    uploadAt: string;
    createdById: number;
    courseId: number;
    announcementId: number | null;
    createdBy: createdBy;
    course: course;
  };
}

type createdBy = {
  id: number;
  email: string;
  prefix: string;
  name: string;
  surname: string;
  role: "ADVISOR" | "STUDENT" | "ADMIN" | "SUPER_ADMIN";
  createdAt: string;
};

type course = {
  id: number;
  name: string;
  description: string;
  program: "CS" | "DSI";
  createdAt: string;
  createdById: number;
};
