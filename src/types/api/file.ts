// GET http://localhost:8000/file/course/2
// POST http://localhost:8000/file/create/course/2
export namespace File {
    export type File = {
        id: number;
        name: string;
        filepath: string;
        uploadAt: string;
        createdById: number;
        courseId: number;
        announcementId: number | null;
        createdBy: uploadBy;
        course: course;
    }
}

type uploadBy = {
    id: number;
    email: string;
    prefix: string;
    name: string;
    surname: string;
    role: "ADVISOR" | "STUDENT" | "ADMIN" | "SUPER_ADMIN";
    createdAt: string;
}

type course = {
    id: number;
    name: string;
    description: string;
    program: "CS" | "DSI";
    createdById: number;
    createdAt: string;
}

export namespace uploadSubmissionFile {
    export type UploadSubmissionFilePayload = {
        id: number;
        submissionId: number;
        deliverableId: number;
        fileUrl: string[];
    }
}