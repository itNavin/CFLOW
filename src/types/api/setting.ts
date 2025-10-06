export namespace createStaffUser {
  export type createStaff = {
    message: string;
    user: Users;
    tempPassword: string;
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
  export type createLecturer = {
    message: string;
    user: Users;
  };
}

export namespace createSolarLecturerUser {
  export type createSolarLecturer = {
    message: string;
    user: Users;
  };
}