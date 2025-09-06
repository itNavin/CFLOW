//http://localhost:8000/dashboard/course/:courseId
export namespace Dashboard{
    export type Dashboard = {
        course: course;
        totals: totals;
        submissions: submissions;
    }

    export type studentInfo = group
}

type group = {
    id: number;
    codeNumber: string;
    projectName: string;
    productName: string;
    company: string;
    members: member[];
    advisors: advisor[];
}

type member = {
    id: number;
    workRole: string;
    courseMemberId: number;
    groupId: number;
    courseMember: courseMember;
}

type advisor = {
    id: number;
    courseMemberId: number;
    advisorRole: string;
    groupId: number;
    courseMember: courseMember;
}

type courseMember = {
    id: number;
    courseId: number;
    userId: number;
    user: user;
}

type user = {
    id: number;
    name: string;
    email: string;
    role: "STUDENT" | "LECTURER" | "STAFF" | "SUPER_ADMIN";
    createdAt: string;
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