export namespace submission {
    export type Submission = {
        id: string;
        submittedAt: string;
        assignmentId: string;
        groupId: string;
        status: "SUBMITTED" | "REJECTED" | "FINAL" | "APPROVED WITH FEEDBACK" | "NOT SUBMITTED";
        missed: boolean;
        version: number;
        comment: string;
    }
}