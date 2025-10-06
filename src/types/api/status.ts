export namespace status{
    export type status = {
        message: string;
        courseId: string;
        filters: filters;
        assignments: assignments[];
    }

    export type filters = {
        assignmentId : boolean;
        groupId : boolean;
        status : boolean;
    }

    export type assignments = {
        assignmentId: string;
        assignmentName: string;
        dueDate: string;
        groups: groups[];
    }

    export type groups = {
        groupId: string;
        codeNumber: string;
        projectName: string;
        status: string;
        submissionId: string | null;
        version: number | null;
        submittedAt: string | null;
    }
}