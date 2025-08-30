export namespace AuthPayload {
  export type Login = {
    message: string;
    token: string;
    user: loginUserType;
  };
}

type loginUserType = {
  id: number;
  email: string;
  role: "STUDENT" | "ADVISOR" | "ADMIN";
  name: string;
};
