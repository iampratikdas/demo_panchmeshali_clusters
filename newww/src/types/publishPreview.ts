export interface PublishPreviewEvent {
    eid: string;
    name: string;
    description?: string;
    logo_url?: string;
    event_type?: string;
    st_dt?: string;
    en_dt?: string;
    pid?: string;
    writerCount: number;
    episodeCount: number;
}

export interface BookEpisode {
    cont_id: string;
    name?: string;
    episodeNumber?: string;
    content?: string;
    wordCount?: number;
    createdAt?: string;
}

export interface BookSeries {
    h_title: string;
    title: string;
    coverImage?: string;
    episodes: BookEpisode[];
}

export interface BookWriter {
    uid: string;
    author_name: string;
    series: BookSeries[];
}

export interface BookPreviewData {
    event: {
        eid: string;
        name: string;
        description?: string;
        logo_url?: string;
        event_type?: string;
        st_dt?: string;
        en_dt?: string;
    };
    writers: BookWriter[];
    stats: { writers: number; episodes: number };
}

export type BookLayoutId =
    | 'textbook'
    | 'spread'
    | 'outline'
    | 'literary'
    | 'memoir'
    | 'magazine';

export interface BookLayoutOption {
    id: BookLayoutId;
    name: string;
    description: string;
    pageBg: string;
    accent: string;
    secondary: string;
    fontFamily: string;
    titleFont: string;
}

export const BOOK_LAYOUTS: BookLayoutOption[] = [
    {
        id: 'textbook',
        name: 'Textbook',
        description: 'Professional layout with gold accents and cover imagery',
        pageBg: '#ffffff',
        accent: '#c9a227',
        secondary: '#4a4a4a',
        fontFamily: '"Segoe UI", system-ui, sans-serif',
        titleFont: 'Georgia, "Times New Roman", serif',
    },
    {
        id: 'spread',
        name: 'Professional Spread',
        description: 'Chapter bars, mirrored footers, justified body text',
        pageBg: '#ffffff',
        accent: '#c9a227',
        secondary: '#e8e8e8',
        fontFamily: 'Georgia, "Times New Roman", serif',
        titleFont: 'Georgia, "Times New Roman", serif',
    },
    {
        id: 'outline',
        name: 'Outline Classic',
        description: 'Centered title page with clean chapter openings',
        pageBg: '#fafafa',
        accent: '#1a1a1a',
        secondary: '#666666',
        fontFamily: 'Georgia, "Times New Roman", serif',
        titleFont: 'Georgia, "Times New Roman", serif',
    },
    {
        id: 'literary',
        name: 'Literary',
        description: 'Drop caps, centered titles, elegant separators',
        pageBg: '#ffffff',
        accent: '#1a1a1a',
        secondary: '#888888',
        fontFamily: 'Georgia, "Times New Roman", serif',
        titleFont: 'Georgia, "Times New Roman", serif',
    },
    {
        id: 'memoir',
        name: 'Memoir',
        description: 'Chapter label, bold title, epigraph-style intro',
        pageBg: '#ffffff',
        accent: '#1a1a1a',
        secondary: '#555555',
        fontFamily: 'Georgia, "Times New Roman", serif',
        titleFont: '"Arial Narrow", "Helvetica Neue", Arial, sans-serif',
    },
    {
        id: 'magazine',
        name: 'Magazine',
        description: 'Bold editorial typography with image blocks',
        pageBg: '#ffffff',
        accent: '#000000',
        secondary: '#333333',
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        titleFont: '"Arial Black", "Helvetica Neue", sans-serif',
    },
];

export type BookPageType = 'cover' | 'toc' | 'chapter' | 'content';

export interface BookPage {
    type: BookPageType;
    title?: string;
    subtitle?: string;
    author?: string;
    html?: string;
    episodeNumber?: string;
    chapterIndex?: number;
    coverImage?: string;
    bookTitle?: string;
    tocEntries?: Array<{ title: string; author: string; pageIndex: number }>;
}
