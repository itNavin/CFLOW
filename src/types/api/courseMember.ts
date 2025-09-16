type cmUser = {
  id: string;
  email: string;
  passwordHash: string;  
  prefix: string;
  name: string;
  surname: string;
  role: "STUDENT" | "ADVISOR" | "ADMIN" | "SUPER_ADMIN";
  createdAt: string;      
};

type cmGroup = {
  id: string;
  courseId: string;
  codeNumber: string;
  projectName: string;
  productName: string | null;
  company: string | null;
};

export namespace getAdvisorMember {
  export type AdvisorMember = advisorMember[];
}

export namespace getStudentNotInCourse{
  export type getStudentNotInCourse = {
    id: string;
    name: string;
    email: string;
    role: "STUDENT";
    createdAt: string;
  };
}

export namespace getAdvisorNotInCourse{
  export type getAdvisorNotInCourse = {
    id: string;
    name: string;
    email: string;
    role: "ADVISOR";
    createdAt: string;
  };
}

type advisorMember = {
  id: string;
  courseId: string;
  user: cmUser & { role: "ADVISOR" };
  projects: advisorProject[];
};

type advisorProject = {
  id: string;
  projectName: string;
  productName: string | null;
  company: string | null;
};

export namespace getStudentMember {
  export type StudentMember = studentMember[];
}

type studentMember = {
  id: string;
  courseId: string;
  userId: string;
  user: cmUser & { role: "STUDENT" }; // restrict to STUDENT
  groupMembers: groupMembers[];
};

type groupMembers = {
  id: string;
  workRole: string;
  courseMemberId: string;
  groupId: string;
  group: cmGroup;
};

export namespace addCourseMember {
  export type AddCourseMemberPayload = {
    message: string;
    requestedCount: number;
    insertedCount: number;
    skippedAsDuplicate: number;
    members: member[];
    existingUserIds: member[];
  };
}

type member = {
  id: string;
  courseId: string;
  userId: string;
  user: user;
  course: course;
};

type user = {
  id: string;
  email: string;
  name: string;
  role: "STUDENT" | "ADVISOR" | "ADMIN" | "SUPER_ADMIN";
  createdAt: string;
};

type course = {
  id: string;
  name: string;
  description: string;
  program: "CS" | "DSI";
  createdById: string;
  createdAt: string;
}