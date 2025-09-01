//http://localhost:8000/dashboard/course/:courseId
export namespace Dashboard{
    export type Dashboard = {
        courses: courses[];
        totals: totals[];
        submissions: submissions[];
    }
}

type courses = {
    id: number;
    name: string;
    description: string;
    program: "CS" | "DSI";
    createdAt: string;
    createBy: createdById[];
}

type createdById = {
    id: number;
    fullName: string;
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
    StatusCount: StatusCount[];
}

type StatusCount = {
    NOT_SUBMITTED: number;
    SUBMITTED: number;
    REJECTED: number;
    APPROVED_WITH_FEEDBACK: number;
    FINAL: number;
}