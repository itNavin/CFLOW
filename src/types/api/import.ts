export namespace uploadTemplate{
    export type UploadTemplatePayload = {
        message: string;
        result: Result;
    };

    export type Result = {
        courseId: string;
        program: "CS" | "DSI";
        groupProcesses: number;
        details: Details[];
    }

    export type Details = {
        groupCode: string;
        groupId: string;
        memberProcesses: number;
        groupMembersInserted: number;
        advisor: string;
        coadvisor: string | null;
        advisorsLinked: number;
        
    }
}