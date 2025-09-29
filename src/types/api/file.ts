// GET http://localhost:8000/file/course/2
// POST http://localhost:8000/file/create/course/2
export namespace File {
    export type Files = {
        id: string;
        name: string;
        filepath: string;
        uploadAt: string;
        createdById: string;
        courseId: string;
        announcementId: number | null;
        createdBy: uploadBy;
        course: course;
    }
}

type uploadBy = {
    id: string;
    email: string;
    prefix: string;
    name: string;
    surname: string;
    role: "ADVISOR" | "STUDENT" | "ADMIN" | "SUPER_ADMIN";
    createdAt: string;
}

type course = {
    id: string;
    name: string;
    description: string;
    program: "CS" | "DSI";
    createdById: string;
    createdAt: string;
    updatedAt: string;
}

export namespace uploadSubmissionFile {
    export type UploadSubmissionFilePayload = {
        id: string;
        submissionId: string;
        deliverableId: string;
        fileUrl: string[];
    }
}