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

/** ---------- Student (Course) Member ---------- **/
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
