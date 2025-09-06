export namespace getAllAssignments {

    export type allAssignment = {
        id: number;
        name: string;
        description: string;
        endDate: string;
        schedule: string;
        courseId: number;
    }

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

    export type getAssignmentWithSubmission = {
        id: number;
        name: string;
        description: string;
        endDate: string;
        schedule: string;
        courseId: number;
        deliverables: Deliverable[];
        assignmentDueDates: AssignmentDueDate[];
        submissions: Submission[];
    }

    type Deliverable = {
        id: number;
        name: string;
        assignmentId: number;
        allowedFileTypes: allowedFileType[];
    }
    type allowedFileType = {
        id: number;
        mime: string;
        type: string;
        deliverableId: number;
    }
    type AssignmentDueDate = {
        id: number;
        assignmentId: number;
        groupId: number;
        dueDate: string;
        createdAt: string;
    }
    type Submission = {
        id: number;
        submittedAt: string;
        assignmentId: number;
        groupId: number;
        comment: string;
        status: string;
        missed: boolean;
        version: number;
        submissionFiles: SubmissionFile[];
        feedbacks: Feedback[];
    }
    type SubmissionFile = {
        id: number;
        submissionId: number;
        deliverableId: number;
        fileUrl: string[];
        deliverable: Deliverable_2;
    }
    type Deliverable_2 = {
        id: number;
        name: string;
        assignmentId: number;
    }
    type Feedback = {
        id: number;
        submissionId: number;
        comment: string;
        createdAt: string;
        feedbackFiles: FeedbackFile[];
    }
    type FeedbackFile = {
        id: number;
        feedbackId: number;
        deliverableId: number;
        fileUrl: string[];
        deliverable: Deliverable_2;
    }

    export type getGroupByLecturer = {
        id: number;
        courseId: number;
        codeNumber: string;
        projectName: string;
        productName: string | null;
        company: string | null;
    }[]
}