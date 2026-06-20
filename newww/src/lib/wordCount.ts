export function countWordsFromHtml(html: string): number {
    if (!html?.trim()) return 0;

    const text = html
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&[a-z]+;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    if (!text) return 0;
    return text.split(' ').filter(word => word.length > 0).length;
}
