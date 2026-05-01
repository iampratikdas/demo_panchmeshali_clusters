import { atom } from 'jotai';

export type PublisherStatus = 'Pending' | 'Accepted' | 'Rejected';

export interface Publisher {
    id: string;
    name: string;
    email: string;
    status: PublisherStatus;
    joinedAt: string;
}

export interface NewsArticle {
    id: string;
    publisherId: string;
    title: string;
    content: string;
    publishedAt: string;
}

// Initial dummy data
const initialPublishers: Publisher[] = [
    { id: 'p1', name: 'Global Tech News', email: 'contact@globaltech.com', status: 'Accepted', joinedAt: '2025-10-01T10:00:00Z' },
    { id: 'p2', name: 'The Daily Writer', email: 'submissions@dailywriter.net', status: 'Pending', joinedAt: '2025-11-20T14:30:00Z' },
    { id: 'p3', name: 'Fiction World', email: 'editors@fictionworld.org', status: 'Rejected', joinedAt: '2025-11-05T09:15:00Z' },
    { id: 'p4', name: 'Poetry Monthly', email: 'hello@poetrymonthly.com', status: 'Accepted', joinedAt: '2025-11-10T11:45:00Z' },
];

const initialNews: NewsArticle[] = [
    {
        id: 'n1',
        publisherId: 'p1',
        title: 'New AI Breakthrough in Content Creation',
        content: 'Artificial intelligence is taking a major leap forward with new models that can assist writers in world-building and character development...',
        publishedAt: '2025-12-01T08:00:00Z'
    },
    {
        id: 'n2',
        publisherId: 'p1',
        title: 'Top 10 Tech Gadgets for Writers',
        content: 'From ergonomic keyboards to e-ink tablets, these are the top gadgets that will help you boost your daily word count...',
        publishedAt: '2025-12-02T09:30:00Z'
    },
    {
        id: 'n3',
        publisherId: 'p2',
        title: 'Writing Prompts for the Winter Season',
        content: 'Get inspired by the cold weather! Here are 50 writing prompts to cure your writer\'s block this winter...',
        publishedAt: '2025-12-03T14:15:00Z'
    },
    {
        id: 'n4',
        publisherId: 'p4',
        title: 'The Resurgence of Spoken Word',
        content: 'Spoken word poetry is seeing a massive revival. We explore the latest trends and highlight rising stars in the community...',
        publishedAt: '2025-12-04T10:45:00Z'
    },
    {
        id: 'n5',
        publisherId: 'p3',
        title: 'Why Sci-Fi is Dominated by Dystopias',
        content: 'An analysis of recent sci-fi trends reveals a heavy leaning towards dystopian futures. We look into why this is happening...',
        publishedAt: '2025-12-05T12:00:00Z'
    }
];

export const publishersAtom = atom<Publisher[]>(initialPublishers);
export const newsAtom = atom<NewsArticle[]>(initialNews);
