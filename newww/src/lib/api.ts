import type { Content, Comment, Story, Poem, ContentStatus } from '../types/content';
import type { AIQualityResponse, AIProofreadResponse, PaginatedResponse } from '../types/api';
import type { Event, CreateEventData } from '../types/event';
import type { User, CreateUserData, EmailData } from '../types/user';
import type { Chat, ChatMessage, SendMessageData } from '../types/chat';
import type { Notification } from '../types/notification';
import apiJson from '../lib/apiJson';
import axios from 'axios';

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
// const mockChats: Chat[] = [
//     {
//         id: 'chat1',
//         writerId: 'u1',
//         writerName: 'John Doe',
//         writerEmail: 'john.doe@example.com',
//         unreadCount: 2,
//         createdAt: '2025-11-20T10:00:00Z',
//         updatedAt: '2025-11-22T14:30:00Z',
//     },
//     {
//         id: 'chat2',
//         writerId: 'u2',
//         writerName: 'Jane Smith',
//         writerEmail: 'jane.smith@example.com',
//         unreadCount: 0,
//         createdAt: '2025-11-18T09:00:00Z',
//         updatedAt: '2025-11-21T16:00:00Z',
//     },
// ];

// const mockMessages: ChatMessage[] = [
//     {
//         id: 'msg1',
//         chatId: 'chat1',
//         senderId: 'admin1',
//         senderName: 'Admin',
//         senderRole: 'admin',
//         message: 'Hi John! I reviewed your latest submission. Great work!',
//         timestamp: '2025-11-22T10:00:00Z',
//         read: true,
//     },
//     {
//         id: 'msg2',
//         chatId: 'chat1',
//         senderId: 'u1',
//         senderName: 'John Doe',
//         senderRole: 'writer',
//         message: 'Thank you! I appreciate the feedback.',
//         timestamp: '2025-11-22T11:30:00Z',
//         read: true,
//     },
//     {
//         id: 'msg3',
//         chatId: 'chat1',
//         senderId: 'admin1',
//         senderName: 'Admin',
//         senderRole: 'admin',
//         message: 'Would you be interested in writing another piece for our winter collection?',
//         timestamp: '2025-11-22T14:30:00Z',
//         read: false,
//     },
//     {
//         id: 'msg4',
//         chatId: 'chat2',
//         senderId: 'u2',
//         senderName: 'Jane Smith',
//         senderRole: 'writer',
//         message: 'Hello! I have a question about the submission guidelines.',
//         timestamp: '2025-11-21T12:00:00Z',
//         read: true,
//     },
//     {
//         id: 'msg5',
//         chatId: 'chat2',
//         senderId: 'admin1',
//         senderName: 'Admin',
//         senderRole: 'admin',
//         message: 'Sure! What would you like to know?',
//         timestamp: '2025-11-21T16:00:00Z',
//         read: true,
//     },
// ];


// Mock users data storage
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
        // page_id: formData.selectedPublisher ?? "",
        event_content: formData.newContent ?? false,
        isOriginalWork: formData.isOriginal ?? false,
        // parent_eid: formData.parentEid ?? "",
        category: formData.category ?? "",
        coverImage: formData.coverImage ?? "",
        backgroundImage: formData.backgroundImage ?? "",
        // content: formData.content ?? "",
        episodeNumber: formData.episodeNumber ?? "",
        publisher: formData.publisher ?? "",
        destination: formData.destination ?? ""
    }
    console.log("formData:================>", form_data);
    const response = await axios.post(`${API_BASE_URL}${apiJson.submitContents.url}`, { ...form_data }, { headers: apiJson.submitContents.headers });
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
// const mockUsers: User[] = [
//     {
//         id: 'u1',
//         fullName: 'John Doe',
//         email: 'john.doe@example.com',
//         password: 'hashed_password_123',
//         status: 'active',
//         createdAt: '2025-01-15T10:00:00Z',
//         lastLogin: '2025-11-22T08:30:00Z',
//     },
//     {
//         id: 'u2',
//         fullName: 'Jane Smith',
//         email: 'jane.smith@example.com',
//         password: 'hashed_password_456',
//         status: 'active',
//         createdAt: '2025-02-20T14:30:00Z',
//         lastLogin: '2025-11-21T16:45:00Z',
//     },
//     {
//         id: 'u3',
//         fullName: 'Mike Johnson',
//         email: 'mike.johnson@example.com',
//         password: 'hashed_password_789',
//         status: 'banned',
//         createdAt: '2025-03-10T09:15:00Z',
//         lastLogin: '2025-10-05T12:20:00Z',
//     },
// ];


// Events API Functions
export const fetchEvents = async (): Promise<Event[]> => {
    const response = await axios.get(`${API_BASE_URL}/event_lists`, { headers: getAuthHeaders() });
    return response.data?.data || [];
};

export const fetchEventById = async (id: string): Promise<Event | null> => {
    // Backend doesn't have an explicit find by ID route, but we can fetch all and filter,
    // or assume we already have it in the list.
    const events = await fetchEvents();
    return events.find(e => e.eid === id) || null;
};

export const createEvent = async (data: CreateEventData): Promise<Event> => {
    const response = await axios.post(`${API_BASE_URL}/create_events`, data, { headers: getAuthHeaders() });
    return response.data?.data;
};

export const updateEvent = async (eid: string, data: Partial<CreateEventData>): Promise<Event> => {
    const response = await axios.put(`${API_BASE_URL}/update_events?eid=${eid}`, data, { headers: getAuthHeaders() });
    return response.data?.data;
};

export const deleteEvent = async (eid: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/delete_events?eid=${eid}`, { headers: getAuthHeaders() });
};

export const fetchPublisherTeamLists = async (): Promise<any[]> => {
    const response = await axios.get(`${API_BASE_URL}/publisher_team_lists`, { headers: getAuthHeaders() });
    return response.data?.data || [];
};

// Users API Functions
export const fetchUsers = async (page: number, limit: number, queryFilters: any = {}): Promise<any> => {
    try {
        const filter: any = {};

        if (queryFilters.searchQuery) {
            filter.$or = [
                { full_name: { $regex: queryFilters.searchQuery, $options: "i" } },
                { email: { $regex: queryFilters.searchQuery, $options: "i" } }
            ];
        }

        if (queryFilters.email) filter.email = { $regex: queryFilters.email, $options: "i" };
        if (queryFilters.full_name) filter.full_name = { $regex: queryFilters.full_name, $options: "i" };
        if (queryFilters.phone_number) filter.phone_number = { $regex: queryFilters.phone_number, $options: "i" };
        if (queryFilters.uid) filter.uid = { $regex: queryFilters.uid, $options: "i" };

        if (queryFilters.isActive && queryFilters.isActive !== 'all') {
            filter.isActive = queryFilters.isActive === 'true';
        }

        if (queryFilters.is_deleted && queryFilters.is_deleted !== 'all') {
            filter.is_deleted = queryFilters.is_deleted === 'true';
        }

        if (queryFilters.roles && Array.isArray(queryFilters.roles)) {
            filter.role = { $in: queryFilters.roles.map((r: string) => r.toLowerCase()) };
        } else if (queryFilters.role && queryFilters.role !== 'All' && queryFilters.role !== 'both') {
            filter.role = queryFilters.role.toLowerCase();
        } else if (queryFilters.role === 'both') {
            filter.role = { $in: ['admin', 'user'] };
        }

        const response = await axios.post(`${API_BASE_URL}${apiJson.searchList.url('admin_search_users', page, limit)}`, { filter }, { headers: apiJson.searchList.headers });
        return response.data;
    } catch (error: any) {
        const errorData = JSON.parse(JSON.stringify(error.response?.data || {}));
        console.log("fetchUsers error payload:", errorData);
        throw new Error(errorData?.message || "API Error");
    }
};

export const createUser = async (data: CreateUserData): Promise<any> => {
    try {
        const payload = {
            full_name: data.full_name,
            email: data.email,
            password: data.password,
            role: data.role || 'user',
            skills: data.skills || 'writer',
            phone_number: data.phone_number || '',
            ph_country_code: data.ph_country_code || '',
            type: data.type || 'writer',
            ip: data.ip || '',
        };
        const response = await axios.post(
            `${API_BASE_URL}/signup`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            }
        );
        return response.data;
    } catch (error: any) {
        const msg = error?.response?.data?.message || 'Failed to create user.';
        throw new Error(msg);
    }
};

// export const banUser = async (userId: string): Promise<User> => {
//     await delay(400);

//     const user = mockUsers.find(u => u.uid === userId);
//     if (!user) throw new Error('User not found');

//     user.isActive = false;
//     return user;
// };

// export const removeUser = async (userId: string): Promise<void> => {
//     await delay(400);

//     const index = mockUsers.findIndex(u => u.uid === userId);
//     if (index === -1) throw new Error('User not found');

//     mockUsers.splice(index, 1);
// };

export const updateUser = async (userId: string, data: any): Promise<any> => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/updateprofile_by_admin?uid=${userId}`,
            data,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            }
        );
        return response.data;
    } catch (error: any) {
        const msg = error?.response?.data?.message || 'Failed to update user.';
        throw new Error(msg);
    }
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


export const fetchChats = async (): Promise<any[]> => {
    const response = await axios.get(`${API_BASE_URL}/chats`, { headers: getAuthHeaders() });
    return response.data?.data || [];
};

export const fetchChatMessages = async (chatId: string, page = 1, limit = 50): Promise<any> => {
    const response = await axios.get(`${API_BASE_URL}/chats/${chatId}/messages?page=${page}&limit=${limit}`, { headers: getAuthHeaders() });
    return response.data?.data || [];
};

export const createChat = async (targetUid: string): Promise<any> => {
    const response = await axios.post(`${API_BASE_URL}/chats/initiate`, { targetUid }, { headers: getAuthHeaders() });
    return response.data?.data;
};

export const markMessagesAsSeen = async (chatId: string): Promise<void> => {
    await axios.patch(`${API_BASE_URL}/chats/${chatId}/seen`, {}, { headers: getAuthHeaders() });
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

// ── Publisher API Functions ───────────────────────────────────────────────────

const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

export const createPublisherCompany = async (data: any): Promise<any> => {
    const response = await axios.post(
        `${API_BASE_URL}/create_publisher_company`,
        data,
        { headers: getAuthHeaders() }
    );
    return response.data;
};

export const fetchAllPublisherCompanies = async (): Promise<any[]> => {
    const response = await axios.get(
        `${API_BASE_URL}/publisher_companies`,
        { headers: getAuthHeaders() }
    );
    return response.data?.data ?? [];
};

/**
 * Fetch all publishers that are visible/assigned to the current writer.
 * GET /publisher_lists/:uid
 */
export const fetchPublisherList = async (uid: string): Promise<any[]> => {
    const response = await axios.get(
        `${API_BASE_URL}/publisher_lists/${uid}`,
        { headers: getAuthHeaders() }
    );
    return response.data?.data ?? [];
};

/**
 * Request to join a publisher (writer → publisher assignment).
 * POST /request_publisher_users/:publisherUid
 */
export const requestJoinPublisher = async (publisherUid: string): Promise<any> => {
    const response = await axios.post(
        `${API_BASE_URL}/request_publisher_users/${publisherUid}`,
        {},
        { headers: getAuthHeaders() }
    );
    return response.data;
};

/**
 * Cancel / remove a publisher assignment.
 * POST /update_publisher_users/:publisherUid   body: { request_type: 'Cancelled' }
 */
export const removePublisherAssignment = async (pid: string): Promise<any> => {
    const response = await axios.post(
        `${API_BASE_URL}/update_publisher_users/${pid}`,
        { request_type: 'Cancelled' },
        { headers: getAuthHeaders() }
    );
    return response.data;
};

// ── Teams Section API Functions ───────────────────────────────────────────────

/**
 * Publisher: fetch all writer requests/members for their company.
 * GET /team_requests
 */
export const fetchTeamRequests = async (): Promise<any> => {
    const response = await axios.get(
        `${API_BASE_URL}/team_requests`,
        { headers: getAuthHeaders() }
    );
    return response.data;
};

/**
 * Publisher: accept / reject / remove a writer.
 * POST /update_team_request/:writerUid
 */
export const updateTeamRequest = async (writerUid: string, requestType: 'Accepted' | 'Rejected' | 'Cancelled'): Promise<any> => {
    const response = await axios.post(
        `${API_BASE_URL}/update_team_request/${writerUid}`,
        { request_type: requestType },
        { headers: getAuthHeaders() }
    );
    return response.data;
};

/**
 * Fetch stats for a specific writer.
 * GET /writer_stats/:writerUid
 */
export const fetchWriterStats = async (writerUid: string): Promise<any> => {
    const response = await axios.get(
        `${API_BASE_URL}/writer_stats/${writerUid}`,
        { headers: getAuthHeaders() }
    );
    return response.data?.data ?? {};
};

/**
 * Writer: leave/remove themselves from a publisher team.
 * POST /update_publisher_users/:pid  body: { request_type: 'Cancelled' }
 */
export const leavePublisherTeam = async (pid: string): Promise<any> => {
    const response = await axios.post(
        `${API_BASE_URL}/update_publisher_users/${pid}`,
        { request_type: 'Cancelled' },
        { headers: getAuthHeaders() }
    );
    return response.data;
};

/**
 * Writer: request to join a publisher company by pid.
 * POST /request_publisher_users/:pid
 */
export const requestJoinPublisherByPid = async (pid: string): Promise<any> => {
    const response = await axios.post(
        `${API_BASE_URL}/request_publisher_users/${pid}`,
        {},
        { headers: getAuthHeaders() }
    );
    return response.data;
};

// ── Publisher Detail Page API Functions ───────────────────────────────────────

/**
 * Fetch full publisher profile by pid.
 * GET /publisher_profile/:pid
 */
export const fetchPublisherProfile = async (pid: string): Promise<any> => {
    const response = await axios.get(
        `${API_BASE_URL}/publisher_profile/${pid}`,
        { headers: getAuthHeaders() }
    );
    return response.data?.data ?? null;
};

/**
 * Fetch analytics/stats for a publisher.
 * GET /publisher_stats/:pid
 */
export const fetchPublisherStats = async (pid: string): Promise<any> => {
    const response = await axios.get(
        `${API_BASE_URL}/publisher_stats/${pid}`,
        { headers: getAuthHeaders() }
    );
    return response.data?.data ?? {};
};

/**
 * Fetch paginated books for a publisher with optional category filter.
 * GET /publisher_books/:pid?page=&limit=&category=
 */
export const fetchPublisherBooks = async (
    pid: string,
    page: number = 1,
    limit: number = 12,
    category: string = 'all'
): Promise<any> => {
    const response = await axios.get(
        `${API_BASE_URL}/publisher_books/${pid}?page=${page}&limit=${limit}&category=${encodeURIComponent(category)}`,
        { headers: getAuthHeaders() }
    );
    return response.data;
};

/**
 * Fetch distinct categories present in a publisher's content.
 * GET /publisher_categories/:pid
 */
export const fetchPublisherCategories = async (pid: string): Promise<string[]> => {
    const response = await axios.get(
        `${API_BASE_URL}/publisher_categories/${pid}`,
        { headers: getAuthHeaders() }
    );
    return response.data?.data ?? [];
};

/**
 * Fetch team requests/assignments by user UID.
 * GET /team_requests_by_uid
 */
export const fetchTeamRequestsByUid = async (): Promise<any> => {
    const response = await axios.get(
        `${API_BASE_URL}/team_requests_by_uid`,
        { headers: getAuthHeaders() }
    );
    return response.data;
};

// ── Active Events (Writer) ────────────────────────────────────────────────────

/**
 * Fetch all active events enriched with publisher name + join status.
 * GET /active_events
 * Accessible by writers only.
 */
export const fetchActiveEvents = async (): Promise<any[]> => {
    const response = await axios.get(
        `${API_BASE_URL}/active_events`,
        { headers: getAuthHeaders() }
    );
    return response.data?.data ?? [];
};

/**
 * Writer joins a non-paid active event.
 * POST /join_event
 * Body: { eid, pid }
 */
export const joinActiveEvent = async (eid: string, pid: string): Promise<any> => {
    const response = await axios.post(
        `${API_BASE_URL}/join_event`,
        { eid, pid },
        { headers: getAuthHeaders() }
    );
    return response.data;
};
