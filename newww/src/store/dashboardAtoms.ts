import { atom } from 'jotai';

/** Status of a writer–publisher assignment as returned by the backend */
export type AssignmentStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Removed';

/**
 * Shape of each publisher entry returned by GET /publisher_lists/:uid.
 * The backend spreads publisher_details onto the object and adds assignment fields.
 */
export interface Publisher {
    /** The publisher's own unique id (from the publishers collection) */
    uid: string;
    /** Display name of the publisher */
    name: string;
    /** Contact email of the publisher */
    email: string;
    /** Phone number (optional) */
    phone?: string;
    /** Description (optional) */
    description?: string;
    /** Publisher logo URL (optional) */
    logo_url?: string;
    /** The UID of the writer in this assignment */
    writer_uid: string;
    /** Current status of the assignment */
    assignment_status: AssignmentStatus;
    /** Who initiated the request: 'writer' | 'publisher' | 'both' */
    requested_by: string;
    /** MongoDB _id of the assignment document — used for UI keying */
    assignment_id: string;
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
