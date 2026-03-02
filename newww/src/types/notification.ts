export interface Notification {
    id: string;
    type: 'comment' | 'submission' | 'approval' | 'rejection' | 'message' | 'system';
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    actionUrl?: string;
}
