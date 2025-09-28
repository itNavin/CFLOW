export namespace getAllAssignments {

    export type getStudentAssignments = {
        message: string;
        assignments: studentAssignment[];
    }

    export type studentAssignment = {
        courseId: string;
        groupId: string;
        counts: Count;
        openTasks: openTasks[];
        submitted: submittedTasks[];
    }

    export type getAllAssignments = {
        message: string;
        assignments: allAssignment[];
    }

    export type allAssignment = {
        id: string;
        name: string;
        description: string;
        endDate: string;
        schedule: string;
        courseId: string;
    }

    export type getStfAndLecAssignment = {
        message: string;
        assignments: stfAssignment[];
    }

    export type stfAssignment = {
        id: string;
        name: string;
        description: string;
        dueDate: string | null;
        endDate: string;
        schedule: string | null;
        courseId: string;
        createdAt: string;
        updatedAt: string;
    }

    export type AssignmentbyOpenTaskandSubmitted ={
        courseId: string;
        groupId: string;
        counts: Count;
        openTasks: openTasks[];
        submitted: submittedTasks[];
    }
    type Count = {
        open: number;
        submitted: number;
    }
    type openTasks = {
        id: string;
        name: string;
        description: string;
        endDate: string;
        schedule: string | null;
        dueDate: string | null;
    } 
    type submittedTasks = {
        id: string;
        name: string;
        description: string;
        endDate: string;
        schedule: string;
        dueDate: string;
    }

    export type getAssignmentWithSubmission = {
        id: string;
        name: string;
        description: string;
        endDate: string;
        schedule: string;
        courseId: string;
        deliverables: Deliverable[];
        assignmentDueDates: AssignmentDueDate[];
        submissions: Submission[];
    }

    type Deliverable = {
        id: string;
        name: string;
        assignmentId: string;
        allowedFileTypes: allowedFileType[];
    }
    type allowedFileType = {
        id: string;
        mime: string;
        type: string;
        deliverableId: string;
    }
    type AssignmentDueDate = {
        id: string;
        assignmentId: string;
        groupId: string;
        dueDate: string;
        createdAt: string;
    }
    type Submission = {
        id: string;
        submittedAt: string;
        assignmentId: string;
        groupId: string;
        comment: string;
        status: string;
        missed: boolean;
        version: number;
        submissionFiles: SubmissionFile[];
        feedbacks: Feedback[];
    }
    type SubmissionFile = {
        id: string;
        submissionId: string;
        deliverableId: string;
        fileUrl: string[];
        deliverable: Deliverable_2;
    }
    type Deliverable_2 = {
        id: string;
        name: string;
        assignmentId: string;
    }
    type Feedback = {
        id: string;
        submissionId: string;
        comment: string;
        createdAt: string;
        feedbackFiles: FeedbackFile[];
    }
    type FeedbackFile = {
        id: string;
        feedbackId: string;
        deliverableId: string;
        fileUrl: string[];
        deliverable: Deliverable_2;
    }

    export type getGroupByLecturer = {
        id: string;
        courseId: string;
        codeNumber: string;
        projectName: string;
        productName: string | null;
        company: string | null;
    }[]
}

export namespace createAssignment {
    export type CreateAssignmentPayload = {
        id: string;
        name: string;
        description: string | null;
        endDate: string;
        schedule: string | null;
        courseId: string;
        deliverables: CreateDeliverablePayload[];
        assignmentDueDates: CreateAssignmentDueDatePayload[];
    }

    export type CreateDeliverablePayload = {
        id: string;
        name: string;
        assignmentId: string;
        allowedFileTypes: CreateAllowedFileTypePayload[];
    }

    export type CreateAllowedFileTypePayload = {
        id: string;
        mime: string;
        type: string;
        deliverableId: string;
    }

    export type CreateAssignmentDueDatePayload = {
        id:string;
        assignmentId: string;
        groupId: number;
        dueDate: string;
        createdAt: string;
    }
}