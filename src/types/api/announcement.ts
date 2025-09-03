//http://localhost:8000/announcement/course/:courseId
export namespace Announcement {
    export type Announcement = {
        id: number;
        courseId: number;
        name: string;
        description: string;
        createdAt: string;
        schedule: string;
        createById: number;
        files: file[];
        createdBy: createById;
    }
}

export namespace createAnnouncement {
    export type createAnnouncementPayload = {
        id: number;
        courseId: number;
        name: string;
        description: string;
        createdAt: string;
        schedule: string;
        createById: number;
        files: file[];
        createdBy: createById;
    }
}

export type file = {
    id: number;
    name: string;
    filepath: string;
    uploadAt: string;
    uploadById: number;
    announcementId: number | null;
}

type createById = {
    id: number;
    email: string;
    prefix: string;
    name: string;
    surname: string;
    role: "ADVISOR" | "STUDENT" | "ADMIN" | "SUPER_ADMIN";
    createdAt: string;
}