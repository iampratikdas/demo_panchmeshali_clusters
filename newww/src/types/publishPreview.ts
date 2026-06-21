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

export type BookLayoutId = 'classic' | 'modern' | 'magazine' | 'elegant';

export interface BookLayoutOption {
    id: BookLayoutId;
    name: string;
    description: string;
    preview: string;
    coverBg: string;
    pageBg: string;
    accent: string;
    fontFamily: string;
}

export const BOOK_LAYOUTS: BookLayoutOption[] = [
    {
        id: 'classic',
        name: 'Classic',
        description: 'Traditional serif typography with warm cream pages',
        preview: 'Aa',
        coverBg: 'linear-gradient(145deg, #2c1810 0%, #5c3d2e 100%)',
        pageBg: '#fdf8f0',
        accent: '#8b6914',
        fontFamily: 'Georgia, serif',
    },
    {
        id: 'modern',
        name: 'Modern',
        description: 'Clean sans-serif layout with generous whitespace',
        preview: 'Aa',
        coverBg: 'linear-gradient(145deg, #0f172a 0%, #1e3a5f 100%)',
        pageBg: '#ffffff',
        accent: '#2563eb',
        fontFamily: 'system-ui, sans-serif',
    },
    {
        id: 'magazine',
        name: 'Magazine',
        description: 'Bold headers and editorial-style chapter breaks',
        preview: 'Aa',
        coverBg: 'linear-gradient(145deg, #7c2d12 0%, #c2410c 100%)',
        pageBg: '#fffbf5',
        accent: '#ea580c',
        fontFamily: '"Palatino Linotype", Palatino, serif',
    },
    {
        id: 'elegant',
        name: 'Elegant',
        description: 'Dark cover with gold accents and refined spacing',
        preview: 'Aa',
        coverBg: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        pageBg: '#faf9f7',
        accent: '#d4af37',
        fontFamily: '"Times New Roman", Times, serif',
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
    tocEntries?: Array<{ title: string; author: string; pageIndex: number }>;
}
