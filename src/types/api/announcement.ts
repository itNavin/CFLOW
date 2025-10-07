//http://localhost:8000/announcement/course/:courseId
export namespace Announcement {
  export type Announcement = {
    message: string;
    announcements: Announcements[];
  };

  export type Announcements = {
    id: string;
    courseId: string;
    name: string;
    description: string;
    createdAt: string;
    schedule: string | null;
    createById: number;
    files: file[];
    createdBy: createById;
  };
}

export namespace createAnnouncement {
  export type Response = {
    message: string;
    announcement: announcementItem;
  };
  export type announcementItem = {
    id: string;
    courseId: string;
    name: string;
    description: string;
    createdAt: string;
    schedule: string | null;
    createById: number;
    files: file[];
    createdBy: createById;
  };
}

export type file = {
  id: string;
  name: string;
  filepath: string;
  uploadAt: string;
  uploadById: number;
  announcementId: string | null;
};

type createById = {
  id: string;
  email: string;
  prefix: string;
  name: string;
  surname: string;
  role: "ADVISOR" | "STUDENT" | "ADMIN" | "SUPER_ADMIN";
  createdAt: string;
};

export namespace updateAnnouncement {
  export type Response = {
    message: string;
    announcement: announcementItem;
  };

  export type announcementItem = {
    id: string;
    courseId: string;
    name: string;
    description: string;
    schedule: string | null;
    createdById: string;
    createdAt: string;
    updatedAt: string;
    createdBy: createBy;
  };
}

export type createBy = {
  id: string;
  name: string;
  email: string;
  password: string | null;
  role: string;
  program: "CS" | "DSI";
  createdAt: string;
};

export namespace deleteAnnouncement {
  export type Response = {
    message: string;
    announcement: announcementItem;
  };

  export type announcementItem = {
    id: string;
    courseId: string;
    name: string;
    description: string;
    schedule: string | null;
    createdById: string;
    createdAt: string;
    updatedAt: string;
    createdBy: createBy;
  };
}
