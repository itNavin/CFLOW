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
