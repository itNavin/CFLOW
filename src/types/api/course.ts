export namespace getCourse{
    export type Course = {
        user : myCourseUser;
        courses : courses[];
        extras : extras;
    }
}

export namespace getStaffCourse{
  export type StaffCourse = {
    message: string;
    course: Course[];
  }
}

export namespace createCourse {
  export type CreateCoursePayload = {
    id: string;
    name: string;
    description?: string | null;
    program: "CS" | "DSI";
    createdById: string;
    createdAt: string;
  };
}

type myCourseUser = {
  id: string;
  email: string;
  prefix: string;
  name: string;
  surname: string;
  role: "ADVISOR" | "STUDENT" | "ADMIN" | "SUPER_ADMIN";
  createdAt: string;
};

type courses = {
    course: Course;
    groupsAsMember: group[];
    groupsAsAdvisor: group[];
}

export type Course = {
  id: string;
  name: string;
  description: string;
  program: "CS" | "DSI";
  // createdById: string;
  // createdAt: string;
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
    createdClasses : Course,
    createdAnnouncement : announcement,
    uploadedFiles : file
}

export namespace getCoursename{
  export type CourseName = {
    coursename: string;
  }
}