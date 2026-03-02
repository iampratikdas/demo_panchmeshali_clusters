export interface ChatMessage {
    id: string;
    chatId: string;
    senderId: string;
    senderName: string;
    senderRole: 'admin' | 'writer';
    message: string;
    timestamp: string;
    read: boolean;
}

export interface Chat {
    id: string;
    writerId: string;
    writerName: string;
    writerEmail: string;
    lastMessage?: ChatMessage;
    unreadCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface SendMessageData {
    chatId: string;
    message: string;
}
