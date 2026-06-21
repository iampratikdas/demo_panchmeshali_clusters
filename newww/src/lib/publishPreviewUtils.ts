import type { BookPreviewData, BookPage, BookLayoutOption } from '../types/publishPreview';

export function buildBookPages(
    data: BookPreviewData,
    _layout: BookLayoutOption,
    options: { showToc: boolean; showCover: boolean }
): BookPage[] {
    const contentPages: BookPage[] = [];
    const tocEntries: NonNullable<BookPage['tocEntries']> = [];

    for (const writer of data.writers) {
        for (const series of writer.series) {
            contentPages.push({
                type: 'chapter',
                title: series.title,
                author: writer.author_name,
                subtitle: `${series.episodes.length} episode${series.episodes.length !== 1 ? 's' : ''}`,
            });

            for (const ep of series.episodes) {
                contentPages.push({
                    type: 'content',
                    title: ep.name || series.title,
                    author: writer.author_name,
                    episodeNumber: ep.episodeNumber,
                    html: ep.content || '<p>No content</p>',
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
        });
        pageOffset++;
    }

    const tocPageIndex = options.showToc ? pageOffset : -1;
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
