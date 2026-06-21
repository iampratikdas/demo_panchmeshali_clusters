import type { Content, ContentStatus, ContentType, Episode } from '../types/content';
import { countWordsFromHtml } from './wordCount';

export interface ApiContentItem {
    cont_id: string;
    eid?: string;
    uid?: string;
    name?: string;
    content?: string;
    status?: string;
    author_name?: string;
    createdAt?: string;
    updatedAt?: string;
    type?: string;
    wordCount?: number;
    category?: string;
    h_title?: string;
    episodeNumber?: string;
    episode_wise?: boolean;
    episode_count?: number;
    series_key?: string;
    episodes?: ApiEpisodeItem[];
    totalMarks?: number;
    marks?: Array<{ uid?: string; score?: number }>;
    pr?: boolean;
}

export interface ApiEpisodeItem {
    cont_id: string;
    name?: string;
    episodeNumber?: string;
    content?: string;
    createdAt?: string;
    status?: string;
    wordCount?: number;
}

const STATUS_TO_UI: Record<string, ContentStatus> = {
    pending: 'Submitted',
    submitted: 'Submitted',
    reviewing: 'Under Review',
    'under review': 'Under Review',
    approved: 'Approved',
    selected: 'Approved',
    rejected: 'Rejected',
};

const UI_TO_STATUS: Record<ContentStatus, string> = {
    Submitted: 'Pending',
    'Under Review': 'Reviewing',
    Approved: 'Approved',
    Rejected: 'Rejected',
};

export function mapStatusFromBackend(status?: string): ContentStatus {
    if (!status) return 'Submitted';
    return STATUS_TO_UI[status.toLowerCase()] ?? 'Submitted';
}

export function mapStatusToBackend(status: ContentStatus): string {
    return UI_TO_STATUS[status] ?? 'Pending';
}

export function parseContentDate(value?: string): string {
    if (!value) return new Date().toISOString();
    const num = Number(value);
    if (!Number.isNaN(num) && num > 1_000_000_000) {
        return new Date(num * 1000).toISOString();
    }
    return value;
}

function countLinesFromHtml(html: string): number {
    const text = html.replace(/<[^>]*>/g, '\n').replace(/&nbsp;/g, ' ');
    return text.split('\n').map(l => l.trim()).filter(Boolean).length || 1;
}

export function mapBackendContent(item: ApiContentItem, episodeWise = false): Content {
    const type: ContentType = item.type?.toLowerCase() === 'poem' ? 'poem' : 'story';
    const createdAt = parseContentDate(item.createdAt);
    const updatedAt = parseContentDate(item.updatedAt ?? item.createdAt);
    const title = item.name || 'Untitled';

    const base = {
        id: item.cont_id,
        title,
        content: item.content || '',
        status: mapStatusFromBackend(item.status),
        createdAt,
        updatedAt,
        authorId: item.uid || '',
        authorName: item.author_name || 'Unknown',
        eid: item.eid,
        h_title: item.h_title,
        episodeNumber: item.episodeNumber,
        episodeWise,
        totalMarks: item.totalMarks ?? 0,
        marks: normalizeMarks(item.marks),
        pr: !!item.pr,
    };

    if (type === 'poem') {
        return {
            ...base,
            type: 'poem',
            lines: countLinesFromHtml(item.content || ''),
            style: item.category,
        };
    }

    return {
        ...base,
        type: 'story',
        wordCount: item.wordCount ?? countWordsFromHtml(item.content || ''),
        genre: item.category,
    };
}

export function mapBackendEpisode(item: ApiContentItem | ApiEpisodeItem): Episode {
    return {
        id: item.cont_id,
        title: item.name || 'Untitled',
        episodeNumber: parseInt(item.episodeNumber || '1', 10) || 1,
        createdAt: parseContentDate(item.createdAt),
        htmlContent: item.content,
        isPremium: false,
    };
}

export function mapBackendContentDetail(item: ApiContentItem): Content {
    const content = mapBackendContent(item, !!item.episode_wise);
    if (item.episode_wise && item.episodes?.length) {
        content.episodes = item.episodes.map(mapBackendEpisode);
        const firstEp = content.episodes[0];
        content.content = firstEp?.htmlContent || content.content;
    }
    return content;
}

export function groupContentForList(
    items: ApiContentItem[],
    episodeWiseEids: Set<string>
): ApiContentItem[] {
    const nonEpisode: ApiContentItem[] = [];
    const groups = new Map<string, ApiContentItem>();

    for (const item of items) {
        if (!item.eid || !episodeWiseEids.has(item.eid)) {
            nonEpisode.push(item);
            continue;
        }

        const key = `${item.eid}:${item.h_title || item.cont_id}`;
        const existing = groups.get(key);
        if (!existing) {
            groups.set(key, item);
            continue;
        }

        const existingEp = parseInt(existing.episodeNumber || '9999', 10);
        const currentEp = parseInt(item.episodeNumber || '9999', 10);
        if (currentEp < existingEp) {
            groups.set(key, item);
        }
    }

    return [...nonEpisode, ...Array.from(groups.values())].sort(
        (a, b) => Number(b.createdAt) - Number(a.createdAt)
    );
}

function normalizeMarks(raw?: Array<{ uid?: string; score?: number | string }>) {
    if (!Array.isArray(raw)) return [];
    return raw
        .map((m) => ({
            uid: m?.uid || '',
            score: Number(m?.score),
        }))
        .filter((m) => !Number.isNaN(m.score));
}

export const MARKS_GIVE_ROLES = new Set(['admin', 'publisher']);

export const MARKS_VIEW_ROLES = new Set([
    'admin',
    'publisher',
    'manager',
    'writer',
    'both',
    'user',
]);

export function canUserGiveMarks(role?: string | null): boolean {
    if (!role) return false;
    return MARKS_GIVE_ROLES.has(role.toLowerCase());
}

export function canUserViewMarks(role?: string | null): boolean {
    if (!role) return false;
    return MARKS_VIEW_ROLES.has(role.toLowerCase());
}

export const COMMENT_ALLOWED_ROLES = new Set([
    'publisher',
    'admin',
    'writer',
    'both',
    'manager',
    'user',
]);

export function canUserComment(role?: string | null): boolean {
    if (!role) return false;
    return COMMENT_ALLOWED_ROLES.has(role.toLowerCase());
}
