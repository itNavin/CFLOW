//http://localhost:8000/dashboard/course/:courseId
export namespace Dashboard{
    export type Dashboard = {
        message: string;
        course: courses;
    }
    export type studentInfo = group
}

type courses = {
    course: course;
    totals: totals;
    submissions: submissions;
}

type group = {
    id: string;
    codeNumber: string;
    projectName: string;
    productName: string;
    company: string;
    members: member[];
    advisors: advisor[];
}

type member = {
    id: string;
    workRole: string;
    courseMemberId: string;
    groupId: string;
    courseMember: courseMember;
}

type advisor = {
    id: string;
    courseMemberId: string;
    advisorRole: string;
    groupId: string;
    courseMember: courseMember;
}

type courseMember = {
    id: string;
    courseId: string;
    userId: string;
    user: user;
}

type user = {
    id: string;
    name: string;
    email: string;
    role: "STUDENT" | "LECTURER" | "STAFF" | "SUPER_ADMIN";
    createdAt: string;
}

type course = {
    id: string;
    name: string;
    description: string;
    program: "CS" | "DSI";
    createdAt: string;
    createdBy: createdBy;
}

type createdBy = {
    id: string;
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