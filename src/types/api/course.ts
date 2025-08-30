export namespace getCourse{
    export type Course = {
        user : myCourseUser;
        courses : courses[];
        extras : extras;
    }
}

type myCourseUser = {
  id: number;
  email: string;
  prefix: string;
  name: string;
  surname: string;
  role: "ADVISOR" | "STUDENT" | "ADMIN" | "SUPER_ADMIN";
  createdAt: string;
};

type courses = {
    course: course;
    groupsAsMember: group[];
    groupsAsAdvisor: group[];
}

type course = {
  id: number;
  name: string;
  description: string;
  program: "CS" | "DSI";
  createdById: number;
  createdAt: string;
};

type group = {
  id: number;
  projectName: string;
  productName: string | null;
  company: string | null;
  advisorRole: string;
};

type announcement = {
  id: number;
  courseId: number;
  name: string;
  description: string;
  createdAt: string;
  schedule: string;
  createById: number;
};

type file = {
  id: number;
  name: string;
  filepath: string;
  uploadAt: string;
  uploadById: number;
  announcementId: number | null;
};

type extras = {
    createdClasses : course,
    createdAnnouncement : announcement,
    uploadedFiles : file
}