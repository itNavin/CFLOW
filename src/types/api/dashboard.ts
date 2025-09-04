//http://localhost:8000/dashboard/course/:courseId
export namespace Dashboard{
    export type Dashboard = {
        course: course;
        totals: totals;
        submissions: submissions;
    }
}

type course = {
    id: number;
    name: string;
    description: string;
    program: "CS" | "DSI";
    createdAt: string;
    createdBy: createdBy;
}

type createdBy = {
    id: number;
    name: string;
    email: string;
}

type totals = {
    students: number;
    advisors: number;
    groups: number;
    assignments: number;
}
type submissions = {
    totalPairs: number;
    statusCounts: statusCounts;
}

type statusCounts = {
    NOT_SUBMITTED: number;
    SUBMITTED: number;
    REJECTED: number;
    APPROVED_WITH_FEEDBACK: number;
    FINAL: number;
}