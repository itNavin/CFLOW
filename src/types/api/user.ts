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

