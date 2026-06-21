import type { BookPreviewData, BookPage, BookLayoutOption } from '../types/publishPreview';

/** Turn relative /public paths into absolute URLs for the dev server. */
export function resolveMediaUrl(url?: string): string | undefined {
    if (!url || !String(url).trim()) return undefined;
    const trimmed = String(url).trim();
    if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
        return trimmed;
    }
    const base = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/api\/?$/, '') || window.location.origin;
    return trimmed.startsWith('/') ? `${base}${trimmed}` : `${base}/${trimmed}`;
}

export function buildBookPages(
    data: BookPreviewData,
    _layout: BookLayoutOption,
    options: { showToc: boolean; showCover: boolean }
): BookPage[] {
    const contentPages: BookPage[] = [];
    const tocEntries: NonNullable<BookPage['tocEntries']> = [];
    const bookTitle = data.event.name;
    const eventLogo = resolveMediaUrl(data.event.logo_url);
    let chapterIdx = 0;

    for (const writer of data.writers) {
        for (const series of writer.series) {
            chapterIdx++;
            const seriesCover = resolveMediaUrl(series.coverImage) || eventLogo;
            contentPages.push({
                type: 'chapter',
                title: series.title,
                author: writer.author_name,
                subtitle: `${series.episodes.length} episode${series.episodes.length !== 1 ? 's' : ''}`,
                chapterIndex: chapterIdx,
                coverImage: seriesCover,
                bookTitle,
            });

            for (const ep of series.episodes) {
                contentPages.push({
                    type: 'content',
                    title: ep.name || series.title,
                    author: writer.author_name,
                    episodeNumber: ep.episodeNumber,
                    html: ep.content || '<p>No content</p>',
                    chapterIndex: chapterIdx,
                    coverImage: seriesCover,
                    bookTitle,
                });
            }
        }
    }

    const pages: BookPage[] = [];
    let pageOffset = 0;

    if (options.showCover) {
        pages.push({
            type: 'cover',
            title: data.event.name,
            subtitle: data.event.description,
            coverImage: eventLogo,
            bookTitle,
            author: data.writers[0]?.author_name,
        });
        pageOffset++;
    }

    if (options.showToc) {
        pageOffset++;
    }

    let contentIdx = pageOffset;
    for (const writer of data.writers) {
        for (const series of writer.series) {
            tocEntries.push({
                title: series.title,
                author: writer.author_name,
                pageIndex: contentIdx,
            });
            contentIdx++;
            contentIdx += series.episodes.length;
        }
    }

    if (options.showToc && tocEntries.length > 0) {
        pages.push({
            type: 'toc',
            title: 'Contents',
            tocEntries,
            bookTitle,
        });
    }

    pages.push(...contentPages);
    return pages;
}

export function formatEventDate(ts?: string): string {
    if (!ts) return '';
    const num = Number(ts);
    const d = num > 1_000_000_000 ? new Date(num * 1000) : new Date(ts);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function plainTextFromHtml(html = ''): string {
    return html
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export function firstCharForDropCap(html = ''): string {
    const text = plainTextFromHtml(html);
    return text.charAt(0).toUpperCase() || 'A';
}
