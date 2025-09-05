export namespace getAllAssignments {
    // export type Assignment = {
    //     id: number;
    //     name: string;
    //     description: string;
    //     endDate: string;
    //     schedule: string;
    //     courseId: number;
    //     deliverables: deliverable[];
    //     assignmentDueDate: assignmentDueDate[];
    // }

    // type deliverable = {
    //     id: number;
    //     name: string;
    //     assignmentId: number;
    //     allowedFileTypes: allowedFileTypes[];
    // }
    // type allowedFileTypes = {
    //     id: number;
    //     mime: string;
    //     type: string;
    //     deliverableId: number;
    // }
    // type assignmentDueDate = {
    //     id: number;
    //     assignmentId: number;
    //     groupId: number;
    //     dueDate: string;
    //     createdAt: string;
    // }

    export type AssignmentbyOpenTaskandSubmitted ={
        courseId: number;
        groupId: number;
        counts: Count;
        openTasks: openTasks[];
        submitted: submittedTasks[];
    }
    type Count = {
        open: number;
        submitted: number;
    }
    type openTasks = {
        id: number;
        name: string;
        description: string;
        endDate: string;
        schedule: string;
        dueDate: string;
    } 
    type submittedTasks = {
        id: number;
        name: string;
        description: string;
        endDate: string;
        schedule: string;
        dueDate: string;
    }

}