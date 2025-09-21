export namespace getGroup {
  export type getAllGroup = {
    message: string;
    groups: Group[];
  }
  export type Group = {
    id: string;
    courseId: string;
    codeNumber: string;
    projectName: string | null;
    productName: string | null;
    company: string | null;
    members: Member[];
    advisors: Advisor[];
  };

  export type Member = {
    id: string;
    workRole: string;
    courseMemberId: string;
    groupId: string;
    courseMember: courseMember;
  };

  export type courseMember = {
    id: string;
    courseId: string;
    userId: string;
    user: User;
  };

  export type User = {
    id: string;
    email: string;
    name: string;
    surname: string;
  };

  export type Advisor = {
    id: string;
    courseMemberId: string;
    advisorRole: "ADVISOR" | "CO_ADVISOR" | string;
    groupId: string;
    courseMember: courseMemberAdvisor;
  };

  export type courseMemberAdvisor = {
    id: string;
    courseId: string;
    userId: string;
    user: UserAdvisor;
  };

  export type UserAdvisor = {
    email: string;
    prefix: string;
    name: string;
    surname: string;
  };

  export type GroupList = Group[];
}

export namespace createGroup {
  export type CreateGroupPayload = {
    message: string;
    group: newGroup;
  };
}

type newGroup = {
  id: string;
  courseId: string;
  codeNumber: string;
  projectName: string;
  productName: string | null;
  company: string | null;
};

type Group = {
  id: string;
  courseId: string;
  codeNumber: string;
  projectName: string;
  productName: string | null;
  company: string | null;
  members: Member[];
  advisors: Advisor[];
};

type Member = {
  id: string;
  workRole: string;
  courseMemberId: string;
  groupId: string;
};

type Advisor = {
  id: string;
  courseMemberId: string;
  advisorRole: "ADVISOR" | "CO_ADVISOR" | string;
  groupId: string;
};
export namespace updateGroup {
  export type UpdateGroupPayload = {
    message: string;
    group: Group;
  };
}
