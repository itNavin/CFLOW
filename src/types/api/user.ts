export namespace User {
  export type User = {
    id: Number;
    email: String;
    passwordHash: String;
    prefix: String;
    name: String;
    surname: String;
    role: String;
    createdAt: Date;
  };
}
