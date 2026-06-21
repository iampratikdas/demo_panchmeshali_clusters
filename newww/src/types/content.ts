export type ContentStatus = 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';

export type ContentType = 'story' | 'poem';

export interface Episode {
    id: string;
    title: string;
    episodeNumber: number;
    createdAt: string;
    views?: number;
    rating?: number;
    readTimeMinutes?: number;
    isPremium?: boolean;
    premiumMessage?: string;
    htmlContent?: string;
}

export interface ContentMark {
    uid: string;
    score: number;
}

export interface BaseContent {
    id: string;
    type: ContentType;
    title: string;
    content: string;
    status: ContentStatus;
    createdAt: string;
    updatedAt: string;
    authorId: string;
    authorName: string;
    episodes?: Episode[];
    eid?: string;
    h_title?: string;
    episodeNumber?: string;
    episodeWise?: boolean;
    totalMarks?: number;
    marks?: ContentMark[];
}

export interface Story extends BaseContent {
    type: 'story';
    wordCount: number;
    genre?: string;
}

export interface Poem extends BaseContent {
    type: 'poem';
    lines: number;
    style?: string;
}

export type Content = Story | Poem;

export interface Comment {
    id: string;
    contentId: string;
    authorId: string;
    authorName: string;
    text: string;
    createdAt: string;
    isReviewer: boolean;
}

export interface ReviewerComment extends Comment {
    isReviewer: true;
    reviewStatus?: ContentStatus;
}
