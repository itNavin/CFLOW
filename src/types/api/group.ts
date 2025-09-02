export namespace getGroup {
  export type Group = {
    id: number;
    courseId: number;
    codeNumber: string;
    projectName: string | null;
    productName: string | null;
    company: string | null;
    members: Member[];
    advisors: Advisor[];
  };

  export type Member = {
    id: number;
    workRole: string;
    courseMemberId: number;
    groupId: number;
    courseMember: courseMember;
  };

  export type courseMember = {
    id: number;
    courseId: number;
    userId: number;
    user: User;
  }

  export type User = {
    id:number;
    email: string;
    name: string;
    surname: string;
  }

  export type Advisor = {
    id: number;
    courseMemberId: number;
    advisorRole: "ADVISOR" | "CO_ADVISOR" | string;
    groupId: number;
    courseMember: courseMemberAdvisor;
  };

  export type courseMemberAdvisor = {
    id: number;
    courseId: number;
    userId: number;
    user: UserAdvisor;
  }

  export type UserAdvisor = {
    email: string;
    prefix: string;
    name: string;
    surname: string;
  }

  export type GroupList = Group[];
}
