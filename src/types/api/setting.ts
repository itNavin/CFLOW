export namespace createStaffUser {
  export type createStaff = {
    message: string;
    user: Users;
    tempPassword: string;
  };
}

export type Users = {
  id: string;
  name: string;
  email: string;
  password: string | null;
  role: string;
  program: "CS" | "DSI";
  createdAt: string;
};

export namespace createLecturerUser {
  export type createLecturer = {
    message: string;
    user: Users;
  };
}

export namespace createSolarLecturerUser {
  export type createSolarLecturer = {
    message: string;
    user: Users;
  };
}

export namespace fetchStudentData{
    export type fetchStudent = {
        message: string;
        summary: StudentSummary[];
        data: data[];
    }

    export type StudentSummary = {
        totalFromAPI: number;
        prepared: number;
        created: number;
        skipped: number;
    }

    export type data = {
        studentId: string;
        prefix: string;
        firstName: string;
        lastName: string;
        prefixEng: string;
        firstNameEng: string;
        lastNameEng: string;
        programNameEng: string;
        statusName: string;
        admittedAcademicSemester: string;
        admittedAcademicYear: string;
    }
}