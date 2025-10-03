export namespace User {
  export type User = {
    id: string;
    email: string;
    passwordHash: string;
    prefix: string;
    name: string;
    surname: string;
    role: string;
    createdAt: Date;
  };
}

export type User = {
  id: string;
  email: string;
  name: string;
  role: "student" | "advisor" | "admin" | "super_admin"; // strict
  program: "CS" | "DSI";
  createdAt: string; // ISO string
};

export namespace getAllUsers {
  export type Response = {
    users: User[];
  };
}

export namespace createStaffUser {
  export type createStaffUserPayload = {
    message: string;
    user: Users;
  };
}

export type Users = {
  id: string;
  name: string;
  email: string;
  password: string | null;
  role: string;
  program: "CS" | "DSI";
  createdAt: string;
};

export namespace createLecturerUser {
  export type createLecturerUserPayload = {
    message: string;
    user: Users;
  };
}

export namespace createSolarLecturerUser {
  export type createSolarLecturerUserPayload = {
    message: string;
    user: Users;
  };
}
