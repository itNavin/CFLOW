export namespace submission {
    export type Submission = {
        id: number;
        submittedAt: string;
        assignmentId: number;
        groupId: number;
        status: "SUBMITTED" | "REJECTED" | "FINAL" | "APPROVED WITH FEEDBACK" | "NOT SUBMITTED";
        missed: boolean;
        version: number;
        comment: string;
    }
}