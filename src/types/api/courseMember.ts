// src/types/api/courseMember.ts

/** ---------- Shared Shapes ---------- **/
type cmUser = {
  id: number;
  email: string;
  passwordHash: string;   // ⚠ backend sends this
  prefix: string;
  name: string;
  surname: string;
  role: "STUDENT" | "ADVISOR" | "ADMIN" | "SUPER_ADMIN";
  createdAt: string;      // ISO datetime string
};

type cmGroup = {
  id: number;
  courseId: number;
  codeNumber: string;
  projectName: string;
  productName: string | null;
  company: string | null;
};

/** ---------- Advisor Member ---------- **/
export namespace getAdvisorMember {
  export type AdvisorMember = advisorMember[];
}

export namespace getStudentNotInCourse{
  export type getStudentNotInCourse = {
    id: number;
    name: string;
    email: string;
    role: "STUDENT";
    createdAt: string;
  };
}

export namespace getAdvisorNotInCourse{
  export type getAdvisorNotInCourse = {
    id: number;
    name: string;
    email: string;
    role: "STUDENT";
    createdAt: string;
  };
}

type advisorMember = {
  id: number;
  courseId: number;
  user: cmUser & { role: "ADVISOR" }; // restrict to ADVISOR
  projects: advisorProject[];
};

type advisorProject = {
  id: number;
  projectName: string;
  productName: string | null;
  company: string | null;
};

export namespace getStudentMember {
  export type StudentMember = studentMember[];
}

type studentMember = {
  id: number;
  courseId: number;
  userId: number;
  user: cmUser & { role: "STUDENT" }; // restrict to STUDENT
  groupMembers: groupMembers[];
};

type groupMembers = {
  id: number;
  workRole: string;
  courseMemberId: number;
  groupId: number;
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
  id: number;
  courseId: number;
  userId: string;
  user: user;
  course: course;
};

type user = {
  id: number;
  email: string;
  name: string;
  role: "STUDENT" | "ADVISOR" | "ADMIN" | "SUPER_ADMIN";
  createdAt: string;
};

type course = {
  id: number;
  name: string;
  description: string;
  program: "CS" | "DSI";
  createdById: string;
  createdAt: string;
}