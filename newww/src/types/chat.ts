export interface ChatMessage {
    _id: string;
    messageId: string;
    chatId: string;
    senderId: string;
    message: string;
    status: 'sent' | 'delivered' | 'seen';
    createdAt: string;
    updatedAt: string;
}

export interface Participant {
    uid: string;
    role: string;
    full_name: string;
    email: string;
}

export interface Chat {
    _id: string;
    chatId: string;
    participants: Participant[];
    lastMessage?: ChatMessage;
    unreadCounts: Record<string, number> | number | any;
    createdAt: string;
    updatedAt: string;
}

export interface SendMessageData {
    chatId: string;
    message: string;
}
