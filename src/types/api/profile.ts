export namespace getProfile {
    export type Profile = {
        message: string;
        profile: profile;
    }
}

type profile = {
    user : user;
    courseNames : string[];
}

type user = {
    id: string;
    name: string;
    email: string;
    role : "STUDENT" | "LECTURER" | "STAFF" | "SUPER_ADMIN";
    program: "CS" | "DSI" | null;
}