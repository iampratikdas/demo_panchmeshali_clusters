import { atom } from 'jotai';

/** Status of a writer–publisher assignment as returned by the backend */
export type AssignmentStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Removed';

/**
 * Shape of each publisher entry returned by GET /publisher_lists/:uid.
 * The backend spreads publisher_details onto the object and adds assignment fields.
 */
export interface Publisher {
    /** Array of associated user IDs */
    uids: string[];

    /** Publisher unique ID */
    pid: string;

    /** Display name of the publisher */
    name: string;

    /** Description */
    description?: string;

    /** Contact email */
    email: string;

    /** Contact phone number */
    phone?: string;

    /** Publisher logo URL */
    logo_url?: string;

    /** Government registration ID */
    rgst_gov_id?: string;

    /** Current publisher status */
    status: string;

    /** Unix timestamp when created */
    createdAt: string;

    /** Unix timestamp when last updated */
    updatedAt: string;

    /** Mongoose version key */
    __v: number;
}

export interface NewsArticle {
    id: string;
    publisherId: string;
    title: string;
    content: string;
    publishedAt: string;
}

/** Live publisher list — populated by the API, empty on init */
export const publishersAtom = atom<Publisher[]>([]);
export const newsAtom = atom<NewsArticle[]>([]);
