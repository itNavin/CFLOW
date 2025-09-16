export namespace AuthPayload {
  export type Login = {
    message: string;
    token: string;
    user: loginUserType;
  };
}

type loginUserType = {
  id: string;
  email: string;
  role: "STUDENT" | "ADVISOR" | "ADMIN" | "SUPER_ADMIN";
  name: string;
};
