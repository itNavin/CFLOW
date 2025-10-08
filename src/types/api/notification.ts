export namespace notification {
    export type     Notification = {
        message: string;
        activities: activity[];
    }

    export type activity = {
        id: string;
        userId: string;
        title: string;
        description: string;
        createdAt: string;
    }
}