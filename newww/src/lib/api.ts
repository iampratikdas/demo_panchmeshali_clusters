import type { Content, Comment, Story, Poem, ContentStatus } from '../types/content';
import type { AIQualityResponse, AIProofreadResponse, PaginatedResponse } from '../types/api';
import type { Event, CreateEventData } from '../types/event';
import type { User, CreateUserData, EmailData } from '../types/user';
import type { Chat, ChatMessage, SendMessageData } from '../types/chat';
import type { Notification } from '../types/notification';

import axios from 'axios';
// Mock notifications data storage
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmdWxsX25hbWUiOiJSaW1wYSDwn4y7IiwiZW1haWwiOiJyaW1wYWJheWVuODQwQGdtYWlsLmNvbSIsInBoX2NvdW50cnlfY29kZSI6IiIsInBob25lX251bWJlciI6Ijg3NjgxOTQxNTciLCJyb2xlIjoidXNlciIsImlhdCI6MTc3MjU2MDUwNiwiZXhwIjoxNzc2MTYwNTA2fQ.HA08PfqUmQb7TAfriinu-EWmMr_THVwuPhOyV26NwfQ"
const API_BASE_URL = import.meta.env.VITE_API_URL;


export const apiCaller = async (data: any, url: string) => {
    try {
        const response = await axios.post(`${API_BASE_URL}${url}`, { ...data });
        return response.data;
    } catch (error) {
        // console.error('Error logging in:', error);
        return error
    }
}



/////////////////////////////////////////////////Mock API's///////////////////////////////////////////////////////////////////////
const mockNotifications: Notification[] = [
    {
        id: 'notif1',
        type: 'comment',
        title: 'New Comment',
        message: 'John Doe commented on your story "The Journey Beyond"',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
        actionUrl: '/content/1',
    },
    {
        id: 'notif2',
        type: 'approval',
        title: 'Content Approved',
        message: 'Your poem "Whispers of Dawn" has been approved for publication',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
        actionUrl: '/content/2',
    },
    {
        id: 'notif3',
        type: 'message',
        title: 'New Message',
        message: 'Jane Smith sent you a message',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
        actionUrl: '/chats',
    },
    {
        id: 'notif4',
        type: 'submission',
        title: 'New Submission',
        message: 'A new story has been submitted for review',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        actionUrl: '/content',
    },
    {
        id: 'notif5',
        type: 'system',
        title: 'System Update',
        message: 'The platform will undergo maintenance tonight at 11 PM',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
];


// Mock chats data storage
const mockChats: Chat[] = [
    {
        id: 'chat1',
        writerId: 'u1',
        writerName: 'John Doe',
        writerEmail: 'john.doe@example.com',
        unreadCount: 2,
        createdAt: '2025-11-20T10:00:00Z',
        updatedAt: '2025-11-22T14:30:00Z',
    },
    {
        id: 'chat2',
        writerId: 'u2',
        writerName: 'Jane Smith',
        writerEmail: 'jane.smith@example.com',
        unreadCount: 0,
        createdAt: '2025-11-18T09:00:00Z',
        updatedAt: '2025-11-21T16:00:00Z',
    },
];

const mockMessages: ChatMessage[] = [
    {
        id: 'msg1',
        chatId: 'chat1',
        senderId: 'admin1',
        senderName: 'Admin',
        senderRole: 'admin',
        message: 'Hi John! I reviewed your latest submission. Great work!',
        timestamp: '2025-11-22T10:00:00Z',
        read: true,
    },
    {
        id: 'msg2',
        chatId: 'chat1',
        senderId: 'u1',
        senderName: 'John Doe',
        senderRole: 'writer',
        message: 'Thank you! I appreciate the feedback.',
        timestamp: '2025-11-22T11:30:00Z',
        read: true,
    },
    {
        id: 'msg3',
        chatId: 'chat1',
        senderId: 'admin1',
        senderName: 'Admin',
        senderRole: 'admin',
        message: 'Would you be interested in writing another piece for our winter collection?',
        timestamp: '2025-11-22T14:30:00Z',
        read: false,
    },
    {
        id: 'msg4',
        chatId: 'chat2',
        senderId: 'u2',
        senderName: 'Jane Smith',
        senderRole: 'writer',
        message: 'Hello! I have a question about the submission guidelines.',
        timestamp: '2025-11-21T12:00:00Z',
        read: true,
    },
    {
        id: 'msg5',
        chatId: 'chat2',
        senderId: 'admin1',
        senderName: 'Admin',
        senderRole: 'admin',
        message: 'Sure! What would you like to know?',
        timestamp: '2025-11-21T16:00:00Z',
        read: true,
    },
];


// Mock users data storage
const mockUsers: User[] = [
    {
        id: 'u1',
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        password: 'hashed_password_123',
        status: 'active',
        createdAt: '2025-01-15T10:00:00Z',
        lastLogin: '2025-11-22T08:30:00Z',
    },
    {
        id: 'u2',
        fullName: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: 'hashed_password_456',
        status: 'active',
        createdAt: '2025-02-20T14:30:00Z',
        lastLogin: '2025-11-21T16:45:00Z',
    },
    {
        id: 'u3',
        fullName: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        password: 'hashed_password_789',
        status: 'banned',
        createdAt: '2025-03-10T09:15:00Z',
        lastLogin: '2025-10-05T12:20:00Z',
    },
];


// Mock event data storage
const mockEvents: Event[] = [
    {
        "eid": "12345",
        "name": "অণুতে অনন্ত ( প্রথম )",
        "description": "First Phase of this competition is over , Please Select the next one অণুতে অনন্ত( দ্বিতীয় ) .",
        "active": true,
        "created_by": "aoSTu6D8pq",
        "team": [
            "অনুপ কুমার বিশ্বাস ",
            "তন্দ্রা নাথ ",
            "সুনন্দা শেঠ "
        ],
        "episode_wise": true, // if false then show episode wise submission .
        //  in dropdwon of Is this a new submission or an update to an existing submission?
        //  in dropdown only new submission but if it is true then also add next  episode in option

        "st_dt": "1755761755",
        "sh_list": 50,
        "en_dt": "1758440155",
        "parent": "",
        "w_count": 200,
        "for_book": true,
        "categories": [],
        "createdAt": "1758719262",
        "updatedAt": "1758719262",
        "__v": 0,
        "logo": "https://admin.panchmeshali.com/logo.png",
        "result": true,
        "type": "vote"
    }
];


// Mock data storage
const mockContents: Content[] = [
    {
        id: '1',
        type: 'story',
        title: 'The Lost Kingdom',
        content: '<p>Once upon a time, in a land far away, there existed a kingdom that was lost to the sands of time...</p>',
        status: 'Approved',
        createdAt: '2025-11-15T10:30:00Z',
        updatedAt: '2025-11-18T14:20:00Z',
        authorId: 'user1',
        authorName: 'John Doe',
        wordCount: 1523,
        genre: 'Fantasy',
        episodes: [
            { id: 'ep1', title: 'The Lost Kingdom', episodeNumber: 1, createdAt: '2022-12-29T00:00:00Z', views: 8000, rating: 4.8, readTimeMinutes: 5, isPremium: false, htmlContent: '<p>Once upon a time, in a land far away, there existed a kingdom lost to the sands of time. Ancient maps spoke of its towering spires and golden gates, but no traveler had ever returned to confirm the tales.</p><p>Young Aryan, a cartographer\'s apprentice, stumbled upon one such faded map tucked inside an old leather journal. His eyes traced the faint ink lines — mountains to the north, a great river to the east, and at the center, a magnificent city labelled <em>The Lost Kingdom</em>.</p><p>He knew then that his journey had just begun.</p>' },
            { id: 'ep2', title: 'The Lost Kingdom ( পর্ব - দুই )', episodeNumber: 2, createdAt: '2022-12-31T00:00:00Z', views: 5000, rating: 4.9, readTimeMinutes: 6, isPremium: false, htmlContent: '<p>Aryan packed his satchel before dawn — the worn journal, a compass, dried fruit, and a stubborn hope. The road north was treacherous, winding through forests so dense the sunlight barely reached the ground.</p><p>On the second evening he found a campfire already lit in a clearing. Around it sat an old woman, silver-haired, eyes reflecting the flames like still water.</p><p><em>"You carry the map,"</em> she said without looking up. It was not a question.</p><p>Aryan gripped the journal tighter. <em>"How do you know?"</em></p><p>She smiled slowly. <em>"Because I drew it."</em></p>' },
            { id: 'ep3', title: 'The Lost Kingdom ( পর্ব - তিন )', episodeNumber: 3, createdAt: '2023-01-01T00:00:00Z', views: 4000, rating: 4.8, readTimeMinutes: 6, isPremium: false, htmlContent: '<p>The old woman\'s name was Mira, and she had spent forty years trying to forget what she had discovered in the northern mountains. The kingdom was real, she confessed — but entering it came with a price no one fully understood until it was too late.</p><p><em>"Those who enter looking for treasure leave with nothing,"</em> she warned, stirring the embers. <em>"Those who enter looking for truth — they sometimes never leave at all."</em></p><p>She handed him a small bronze key, cold and heavy. <em>"The gate will ask you a question. Think carefully before you answer."</em></p>' },
            { id: 'ep4', title: 'The Lost Kingdom ( পর্ব - চার )', episodeNumber: 4, createdAt: '2023-01-03T00:00:00Z', isPremium: true, premiumMessage: 'পর্বটি পড়ার জন্য প্রতিলিপি অ্যাপ ডাউনলোড করুন' },
            { id: 'ep5', title: 'The Lost Kingdom ( পর্ব - পাঁচ )', episodeNumber: 5, createdAt: '2023-01-05T00:00:00Z', isPremium: true, premiumMessage: 'পর্বটি পড়ার জন্য প্রতিলিপি অ্যাপ ডাউনলোড করুন' },
            { id: 'ep6', title: 'The Lost Kingdom ( পর্ব - ছয় )', episodeNumber: 6, createdAt: '2023-01-07T00:00:00Z', isPremium: true, premiumMessage: 'পর্বটি পড়ার জন্য প্রতিলিপি অ্যাপ ডাউনলোড করুন' },
            { id: 'ep7', title: 'The Lost Kingdom ( পর্ব - সাত )', episodeNumber: 7, createdAt: '2023-01-10T00:00:00Z', isPremium: true, premiumMessage: 'পর্বটি পড়ার জন্য প্রতিলিপি অ্যাপ ডাউনলোড করুন' },
            { id: 'ep8', title: 'The Lost Kingdom ( পর্ব - আট )', episodeNumber: 8, createdAt: '2023-01-12T00:00:00Z', isPremium: true, premiumMessage: 'পর্বটি পড়ার জন্য প্রতিলিপি অ্যাপ ডাউনলোড করুন' },
        ],
    } as Story,
    {
        id: '2',
        type: 'poem',
        title: 'Whispers of the Wind',
        content: '<p>Gentle breeze through autumn leaves<br/>Dancing shadows, nature weaves<br/>Silent songs of days gone by<br/>Beneath the ever-changing sky</p>',
        status: 'Under Review',
        createdAt: '2025-11-20T08:15:00Z',
        updatedAt: '2025-11-20T08:15:00Z',
        authorId: 'user1',
        authorName: 'John Doe',
        lines: 4,
        style: 'Lyric',
    } as Poem,
    {
        id: '3',
        type: 'story',
        title: 'Digital Dreams',
        content: '<p>In the year 2157, humanity had finally achieved what was once thought impossible...</p>',
        status: 'Submitted',
        createdAt: '2025-11-22T12:00:00Z',
        updatedAt: '2025-11-22T12:00:00Z',
        authorId: 'user1',
        authorName: 'John Doe',
        wordCount: 892,
        genre: 'Sci-Fi',
    } as Story,
    {
        id: '4',
        type: 'poem',
        title: 'Midnight Reflections',
        content: '<p>Stars above in velvet night<br/>Moon casting silver light<br/>Dreams and wishes take their flight<br/>Till the dawn brings morning bright</p>',
        status: 'Rejected',
        createdAt: '2025-11-10T19:45:00Z',
        updatedAt: '2025-11-12T10:30:00Z',
        authorId: 'user1',
        authorName: 'John Doe',
        lines: 4,
        style: 'Rhyme',
    } as Poem,
];

const mockComments: Comment[] = [
    {
        id: 'c1',
        contentId: '1',
        authorId: 'reviewer1',
        authorName: 'Sarah Editor',
        text: 'Excellent world-building! The narrative flows beautifully.',
        createdAt: '2025-11-18T14:20:00Z',
        isReviewer: true,
    },
    {
        id: 'c2',
        contentId: '2',
        authorId: 'reviewer2',
        authorName: 'Mike Reviewer',
        text: 'Beautiful imagery. Considering for approval.',
        createdAt: '2025-11-21T09:00:00Z',
        isReviewer: true,
    },
    {
        id: 'c3',
        contentId: '4',
        authorId: 'reviewer1',
        authorName: 'Sarah Editor',
        text: 'The rhyme scheme needs work. Please revise and resubmit.',
        createdAt: '2025-11-12T10:30:00Z',
        isReviewer: true,
    },
];

// Simulated delay for API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API Functions
export const fetchContents = async (
    page: number = 1,
    pageSize: number = 10,
    status?: ContentStatus
): Promise<PaginatedResponse<Content>> => {
    await delay(800);

    let filtered = [...mockContents];
    if (status) {
        filtered = filtered.filter(c => c.status === status);
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const data = filtered.slice(start, end);

    return {
        data,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
    };
};

export const fetchContentById = async (id: string): Promise<Content | null> => {
    await delay(500);
    return mockContents.find(c => c.id === id) || null;
};

export const fetchCommentsByContentId = async (contentId: string): Promise<Comment[]> => {
    await delay(400);
    return mockComments.filter(c => c.contentId === contentId);
};

export const submitContent = async (
    formData: any
): Promise<any> => {
    // await delay(1000);
    const form_data = {
        type: formData.type,
        storyName: formData.title,
        eid: formData.selectedEventId ?? "",
        storyContent: formData.content,
        url: formData.selectedFolder ?? "",
        page_id: formData.selectedPublisher ?? "",
        event_content: formData.newContent ?? false,
        isOriginalWork: formData.isOriginal ?? false,
        parent_eid: formData.parentEid ?? "",
        // content: formData.content ?? "",
        episodeNumber: formData.episodeNumber ?? "",
        destination: formData.destination ?? ""
    }
    console.log("formData:================>", form_data);
    const response = await axios.post(`${API_BASE_URL}/submit_contents`, form_data, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`
        },
    });
    return response.data;
};

export const addComment = async (
    contentId: string,
    text: string
): Promise<Comment> => {
    await delay(600);

    const newComment: Comment = {
        id: `c${mockComments.length + 1}`,
        contentId,
        authorId: 'user1',
        authorName: 'John Doe',
        text,
        createdAt: new Date().toISOString(),
        isReviewer: false,
    };

    mockComments.push(newComment);
    return newComment;
};

export const checkQualityAI = async (content: string): Promise<AIQualityResponse> => {
    await delay(1500);

    return {
        score: Math.floor(Math.random() * 30) + 70, // 70-100
        feedback: [
            'Strong narrative voice detected',
            'Engaging opening paragraph',
            'Good use of descriptive language',
        ],
        strengths: [
            'Character development',
            'Pacing',
            'Dialogue flow',
        ],
        improvements: [
            'Consider varying sentence structure',
            'Add more sensory details',
            'Strengthen the conclusion',
        ],
    };
};

export const proofreadAI = async (content: string): Promise<AIProofreadResponse> => {
    await delay(1200);

    return {
        correctedText: content.replace(/\s{2,}/g, ' ').trim(),
        corrections: [
            {
                original: 'recieve',
                corrected: 'receive',
                reason: 'Spelling error - i before e except after c',
            },
            {
                original: 'thier',
                corrected: 'their',
                reason: 'Common spelling mistake',
            },
        ],
        summary: 'Found 2 corrections. Overall grammar and structure look good!',
    };
};

// Events API Functions
export const fetchEvents = async (): Promise<Event[]> => {
    await delay(600);
    return [...mockEvents].sort((a, b) =>
        parseInt(b.createdAt) - parseInt(a.createdAt)
    );
};

export const fetchEventById = async (id: string): Promise<Event | null> => {
    await delay(400);
    return mockEvents.find(e => e.eid === id) || null;
};

export const createEvent = async (data: CreateEventData): Promise<Event> => {
    await delay(1000);

    const now = Math.floor(Date.now() / 1000).toString();

    const newEvent: Event = {
        eid: `ev${mockEvents.length + 1}`,
        name: data.name,
        description: data.description,
        active: data.active,
        created_by: 'admin1', // Default admin ID
        team: data.team,
        st_dt: data.st_dt,
        en_dt: data.en_dt,
        parent: data.parent || '',
        w_count: data.w_count,
        sh_list: data.sh_list,
        categories: data.categories,
        episode_wise: false, // Default to false for new events
        logo: data.logo,
        result: false, // New events don't have results yet
        type: data.type,
        createdAt: now,
        updatedAt: now,
        __v: 0,
    };

    mockEvents.unshift(newEvent);
    return newEvent;
};

// Users API Functions
export const fetchUsers = async (): Promise<User[]> => {
    await delay(500);
    return [...mockUsers].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
};

export const createUser = async (data: CreateUserData): Promise<User> => {
    await delay(800);

    // Check if email already exists
    if (mockUsers.some(u => u.email === data.email)) {
        throw new Error('Email already exists');
    }

    const newUser: User = {
        id: `u${mockUsers.length + 1}`,
        fullName: data.fullName,
        email: data.email,
        password: `hashed_${data.password}`, // Simulating password hashing
        status: 'active',
        createdAt: new Date().toISOString(),
    };

    mockUsers.unshift(newUser);
    return newUser;
};

export const banUser = async (userId: string): Promise<User> => {
    await delay(400);

    const user = mockUsers.find(u => u.id === userId);
    if (!user) throw new Error('User not found');

    user.status = 'banned';
    return user;
};

export const removeUser = async (userId: string): Promise<void> => {
    await delay(400);

    const index = mockUsers.findIndex(u => u.id === userId);
    if (index === -1) throw new Error('User not found');

    mockUsers.splice(index, 1);
};

export const sendEmail = async (emailData: EmailData): Promise<{ success: boolean; message: string }> => {
    await delay(1000);

    // Simulate email sending
    console.log('Sending email to:', emailData.to);
    console.log('Subject:', emailData.subject);
    console.log('Message:', emailData.message);

    return {
        success: true,
        message: `Email sent successfully to ${emailData.to.length} recipient(s)`,
    };
};

// Chats API Functions
export const fetchChats = async (): Promise<Chat[]> => {
    await delay(400);

    // Update last message for each chat
    const chatsWithMessages = mockChats.map(chat => {
        const chatMessages = mockMessages.filter(m => m.chatId === chat.id);
        const lastMessage = chatMessages[chatMessages.length - 1];
        const unreadCount = chatMessages.filter(m => m.senderRole === 'writer' && !m.read).length;

        return {
            ...chat,
            lastMessage,
            unreadCount,
        };
    });

    return chatsWithMessages.sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
};

export const fetchChatMessages = async (chatId: string): Promise<ChatMessage[]> => {
    await delay(300);

    return mockMessages
        .filter(m => m.chatId === chatId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

export const sendMessage = async (data: SendMessageData): Promise<ChatMessage> => {
    await delay(500);

    const newMessage: ChatMessage = {
        id: `msg${mockMessages.length + 1}`,
        chatId: data.chatId,
        senderId: 'admin1',
        senderName: 'Admin',
        senderRole: 'admin',
        message: data.message,
        timestamp: new Date().toISOString(),
        read: false,
    };

    mockMessages.push(newMessage);

    // Update chat's updatedAt
    const chat = mockChats.find(c => c.id === data.chatId);
    if (chat) {
        chat.updatedAt = new Date().toISOString();
    }

    return newMessage;
};

export const createChat = async (writerId: string): Promise<Chat> => {
    await delay(600);

    // Check if chat already exists
    const existingChat = mockChats.find(c => c.writerId === writerId);
    if (existingChat) {
        return existingChat;
    }

    // Find writer from mockUsers
    const writer = mockUsers.find(u => u.id === writerId);
    if (!writer) {
        throw new Error('Writer not found');
    }

    const newChat: Chat = {
        id: `chat${mockChats.length + 1}`,
        writerId: writer.id,
        writerName: writer.fullName,
        writerEmail: writer.email,
        unreadCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    mockChats.unshift(newChat);
    return newChat;
};

// Notifications API Functions
export const fetchNotifications = async (): Promise<Notification[]> => {
    await delay(300);

    return mockNotifications.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    await delay(200);

    const notification = mockNotifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
    }
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
    await delay(300);

    mockNotifications.forEach(n => {
        n.read = true;
    });
};

export const getUnreadNotificationsCount = async (): Promise<number> => {
    await delay(100);

    return mockNotifications.filter(n => !n.read).length;
};

