//http://localhost:8000/announcement/course/:courseId
export namespace Announcement {
    export type Announcement = {
        message: string;
        announcements: Announcements[];
    }

    export type Announcements = {
        id: string;
        courseId: string;
        name: string;
        description: string;
        createdAt: string;
        schedule: string;
        createById: number;
        files: file[];
        createdBy: createById;
    };
}

export namespace createAnnouncement {
    export type createAnnouncementPayload = {
        id: string;
        courseId: string;
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
    id: string;
    name: string;
    filepath: string;
    uploadAt: string;
    uploadById: number;
    announcementId: string | null;
}

type createById = {
    id: string;
    email: string;
    prefix: string;
    name: string;
    surname: string;
    role: "ADVISOR" | "STUDENT" | "ADMIN" | "SUPER_ADMIN";
    createdAt: string;
}