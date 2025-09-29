export namespace uploadCourseFile {
  export type uploadCourseFileResponse = {
    message: string;
    files: Files[];
    accepted: accepted
  };

  export type Files = {
    id: string;
    name: string;
    filepath: string;
    createdById: string;
    courseId: string;
    announcementId: number | null;
    uploadAt: string;
    createdBy: createdBy;
    course: course;
  };

  export type accepted = {
    ext: string;
    mime: string;
    size: number;
  }
}

type createdBy = {
  id: string;
  email: string;
  prefix: string;
  name: string;
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
  updatedAt: string;
};
