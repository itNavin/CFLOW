type cmUser = {
  id: string;
  email: string;
  name: string;
  role: "STUDENT" | "ADVISOR" | "ADMIN" | "SUPER_ADMIN";
  program: "CS" | "DSI";
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
  export type AdvisorMember = { 
    message: string;
    advisors: advisorMember[]; 
  };
}

export namespace getStudentNotInCourse {
  export type getStudentNotInCourse = {
    message: string;
    students: studentNotInCourse[];
  };
}

export type studentNotInCourse = {
  id: string;
  name: string;
  email: string;
  role: "STUDENT";
  program: "CS" | "DSI";
  createdAt: string;
};

export namespace getAdvisorNotInCourse {
  export type getAdvisorNotInCourse = {
    message: string;
    advisors: advisorNotinCourse[];
  };
}

type advisorNotinCourse = {
  id: string;
  name: string;
  email: string;
  role: "ADVISOR";
  program: "CS" | "DSI";
  createdAt: string;
};

export type advisorMember = {
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
  export type StudentMember = {
    message: string;
    students: studentMember[];
  };
}

export type studentMember = {
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
  program: "CS" | "DSI";
  createdAt: string;
};

type course = {
  id: string;
  name: string;
  description: string;
  program: "CS" | "DSI";
  createdById: string;
  createdAt: string;
};

export namespace deleteCourseMember {
  export type DeleteCourseMemberPayload = {
    message: string;
    result: result;
  };
}

type result = {
  requestedIds: string[];
  deletedIds: string[];
  notFoundIds: string[];
  blocked: string[];
};


export namespace deleteCourseMemberByUserId {
  export type DeleteCourseMemberByUserIdPayload = {
    message: string;
    result: resultByUserId;
  };
}

type resultByUserId = {
  requestedIds: string[];
  deletedIds: string[];
  notFoundIds: string[];
  blocked: string[];
};

export namespace getStaffMember {
  export type StaffMember = { 
    message: string;
    staff: staffMember[]; 
  };

  export type staffMember = {
    id: string;
    courseId: string;
    userId: string;
    createdAt: string;
    user: users;
  }

  export type users = {
    id: string;
    name: string;
    email: string;
    role: string;
    program: "CS" | "DSI" | "BOTH";
    createdAt: string;
  }
}

export namespace getStaffNotInCourse {
  export type getStaffNotInCourse = {
    message: string;
    staff: staffNotInCourse[];
  };

  export type staffNotInCourse = {
    id: string;
    name: string;
    email: string;
    role: string;
    program: "CS" | "DSI" | "BOTH";
    createdAt: string;
  }
}