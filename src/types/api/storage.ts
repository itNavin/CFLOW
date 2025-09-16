export namespace uploadCourseFile {
  export type uploadCourseFilePayload = {
    id: string;
    name: string;
    filepath: string;
    uploadAt: string;
    createdById: string;
    courseId: string;
    announcementId: number | null;
    createdBy: createdBy;
    course: course;
  };
}

type createdBy = {
  id: string;
  email: string;
  prefix: string;
  name: string;
  surname: string;
  role: "ADVISOR" | "STUDENT" | "ADMIN" | "SUPER_ADMIN";
  createdAt: string;
};

type course = {
  id: string;
  name: string;
  description: string;
  program: "CS" | "DSI";
  createdAt: string;
  createdById: string;
};
