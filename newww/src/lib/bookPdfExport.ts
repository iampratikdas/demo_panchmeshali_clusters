import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { BookPageRenderer } from '../components/publish/BookLayoutPages';
import { resolveMediaUrl } from './publishPreviewUtils';
import type { BookLayoutOption, BookPage } from '../types/publishPreview';

const PAGE_W_PX = 794;
const PAGE_H_PX = 1123;
const A4_W_MM = 210;
const A4_H_MM = 297;

/** Hex-only CSS for iframe — avoids Tailwind oklch which html2canvas cannot parse. */
const PDF_IFRAME_STYLES = `
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #ffffff; color: #1a1a1a; }
  img { max-width: 100%; display: block; }
  .book-prose p { margin-bottom: 1.2em; text-align: justify; text-indent: 1.8em; color: #2d2d2d; }
  .book-prose p:first-child { text-indent: 0; }
  .book-prose h1, .book-prose h2, .book-prose h3 {
    font-family: Georgia, serif; font-weight: 700; margin-top: 1.6em; margin-bottom: 0.6em;
    color: #1a1a1a; text-align: center; text-indent: 0;
  }
  .book-prose h1 { font-size: 1.5rem; }
  .book-prose h2 { font-size: 1.25rem; }
  .book-prose h3 { font-size: 1.1rem; }
  .book-prose blockquote {
    border-left: 3px solid #c9a84c; padding: 0.5em 1.2em; margin: 1.2em 0;
    font-style: italic; color: #555555; background: rgba(201,168,76,0.06); border-radius: 0 6px 6px 0;
  }
  .book-prose ul, .book-prose ol { margin: 1em 0 1em 1.5em; }
  .book-prose li { margin-bottom: 0.4em; }
  .book-prose strong { color: #111111; }
  .book-prose em { font-style: italic; }
  .literary-drop-cap p:first-child::first-letter,
  .memoir-drop-cap p:first-child::first-letter {
    float: left; font-size: 3.5rem; line-height: 0.82; padding-right: 0.12em;
    margin-top: 0.05em; font-weight: 700; font-family: Georgia, serif; color: #1a1a1a;
  }
  .literary-drop-cap p:first-child, .memoir-drop-cap p:first-child { text-indent: 0; }
  .magazine-columns { column-count: 2; column-gap: 1.5rem; }
  .magazine-columns p { break-inside: avoid; }
  .text-gray-900 { color: #111827; }
  .text-gray-700 { color: #374151; }
  .text-gray-600 { color: #4b5563; }
  .text-gray-500 { color: #6b7280; }
  .text-gray-400 { color: #9ca3af; }
  .bg-white { background-color: #ffffff; }
  .bg-gray-50 { background-color: #f9fafb; }
  .bg-gray-100 { background-color: #f3f4f6; }
  .bg-gray-200 { background-color: #e5e7eb; }
  .bg-gray-300 { background-color: #d1d5db; }
  .border-gray-100 { border-color: #f3f4f6; }
  .border-gray-200 { border-color: #e5e7eb; }
  .border-black { border-color: #000000; }
  .border-black\\/5 { border-color: rgba(0,0,0,0.05); }
  .border-black\\/20 { border-color: rgba(0,0,0,0.2); }
  .border-black\\/25 { border-color: rgba(0,0,0,0.25); }
  .border-black\\/30 { border-color: rgba(0,0,0,0.3); }
  .border-dotted { border-style: dotted; }
  .border-dashed { border-style: dashed; }
  .border-b { border-bottom-width: 1px; border-bottom-style: solid; }
  .border-b-2 { border-bottom-width: 2px; border-bottom-style: solid; }
  .border-t { border-top-width: 1px; border-top-style: solid; }
  .border { border-width: 1px; border-style: solid; }
  .border-r { border-right-width: 1px; border-right-style: solid; }
  .h-px { height: 1px; }
  .w-24 { width: 6rem; }
  .w-20 { width: 5rem; }
  .w-full { width: 100%; }
  .h-full { height: 100%; }
  .flex { display: flex; }
  .flex-1 { flex: 1 1 0%; }
  .flex-col { flex-direction: column; }
  .items-center { align-items: center; }
  .items-end { align-items: flex-end; }
  .items-baseline { align-items: baseline; }
  .items-start { align-items: flex-start; }
  .justify-center { justify-content: center; }
  .justify-between { justify-content: space-between; }
  .justify-end { justify-content: flex-end; }
  .self-end { align-self: flex-end; }
  .shrink-0 { flex-shrink: 0; }
  .overflow-hidden { overflow: hidden; }
  .overflow-y-auto { overflow-y: auto; }
  .relative { position: relative; }
  .absolute { position: absolute; }
  .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
  .text-center { text-align: center; }
  .text-right { text-align: right; }
  .text-left { text-align: left; }
  .text-justify { text-align: justify; }
  .uppercase { text-transform: uppercase; }
  .italic { font-style: italic; }
  .font-bold { font-weight: 700; }
  .font-semibold { font-weight: 600; }
  .font-black { font-weight: 900; }
  .font-light { font-weight: 300; }
  .font-serif { font-family: Georgia, serif; }
  .leading-tight { line-height: 1.25; }
  .leading-none { line-height: 1; }
  .leading-relaxed { line-height: 1.625; }
  .leading-snug { line-height: 1.375; }
  .tracking-widest { letter-spacing: 0.1em; }
  .tracking-wider { letter-spacing: 0.05em; }
  .tracking-tight { letter-spacing: -0.025em; }
  .tracking-tighter { letter-spacing: -0.05em; }
  .line-clamp-2 { overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
  .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .rounded { border-radius: 0.25rem; }
  .rounded-sm { border-radius: 0.125rem; }
  .rounded-lg { border-radius: 0.5rem; }
  .object-cover { object-fit: cover; }
  .grayscale { filter: grayscale(100%); }
  .opacity-20 { opacity: 0.2; }
  .opacity-30 { opacity: 0.3; }
  .opacity-70 { opacity: 0.7; }
  .opacity-80 { opacity: 0.8; }
  .z-10 { z-index: 10; }
  .pointer-events-none { pointer-events: none; }
  .float-left { float: left; }
  .grid { display: grid; }
  .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .gap-0\\.5 { gap: 0.125rem; }
  .gap-4 { gap: 1rem; }
  .space-y-3 > * + * { margin-top: 0.75rem; }
  .aspect-square { aspect-ratio: 1 / 1; }
  .aspect-video { aspect-ratio: 16 / 9; }
  .max-w-xs { max-width: 20rem; }
  .max-w-sm { max-width: 24rem; }
  .max-w-md { max-width: 28rem; }
  .max-h-40 { max-height: 10rem; }
  .max-w-\\[50\\%\\] { max-width: 50%; }
  .mx-auto { margin-left: auto; margin-right: auto; }
  .mx-6 { margin-left: 1.5rem; margin-right: 1.5rem; }
  .mt-0\\.5 { margin-top: 0.125rem; }
  .mt-1 { margin-top: 0.25rem; }
  .mt-2 { margin-top: 0.5rem; }
  .mt-3 { margin-top: 0.75rem; }
  .mt-4 { margin-top: 1rem; }
  .mt-6 { margin-top: 1.5rem; }
  .mt-8 { margin-top: 2rem; }
  .mb-2 { margin-bottom: 0.5rem; }
  .mb-3 { margin-bottom: 0.75rem; }
  .mb-4 { margin-bottom: 1rem; }
  .mb-6 { margin-bottom: 1.5rem; }
  .mr-4 { margin-right: 1rem; }
  .my-1 { margin-top: 0.25rem; margin-bottom: 0.25rem; }
  .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
  .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
  .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
  .px-8 { padding-left: 2rem; padding-right: 2rem; }
  .px-10 { padding-left: 2.5rem; padding-right: 2.5rem; }
  .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
  .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
  .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
  .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
  .py-5 { padding-top: 1.25rem; padding-bottom: 1.25rem; }
  .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
  .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
  .py-10 { padding-top: 2.5rem; padding-bottom: 2.5rem; }
  .py-12 { padding-top: 3rem; padding-bottom: 3rem; }
  .pt-5 { padding-top: 1.25rem; }
  .pt-6 { padding-top: 1.5rem; }
  .pt-8 { padding-top: 2rem; }
  .pt-10 { padding-top: 2.5rem; }
  .pt-12 { padding-top: 3rem; }
  .pb-2 { padding-bottom: 0.5rem; }
  .pb-3 { padding-bottom: 0.75rem; }
  .pb-4 { padding-bottom: 1rem; }
  .pl-1 { padding-left: 0.25rem; }
  .pr-1 { padding-right: 0.25rem; }
  .p-2 { padding: 0.5rem; }
  .p-6 { padding: 1.5rem; }
  .text-\\[9px\\] { font-size: 9px; }
  .text-\\[10px\\] { font-size: 10px; }
  .text-\\[11px\\] { font-size: 11px; }
  .text-xs { font-size: 0.75rem; line-height: 1rem; }
  .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
  .text-base { font-size: 1rem; line-height: 1.5rem; }
  .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
  .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
  .text-2xl { font-size: 1.5rem; line-height: 2rem; }
  .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
  .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
  .text-\\[0\\.85rem\\] { font-size: 0.85rem; }
  .text-\\[0\\.9rem\\] { font-size: 0.9rem; }
  .text-\\[0\\.92rem\\] { font-size: 0.92rem; }
  .text-\\[0\\.95rem\\] { font-size: 0.95rem; }
  .leading-\\[1\\.85\\] { line-height: 1.85; }
  .leading-\\[1\\.9\\] { line-height: 1.9; }
  .min-h-\\[140px\\] { min-height: 140px; }
  .h-10 { height: 2.5rem; }
  .h-12 { height: 3rem; }
  .h-20 { height: 5rem; }
  .h-28 { height: 7rem; }
  .w-10 { width: 2.5rem; }
  .w-12 { width: 3rem; }
  .w-6 { width: 1.5rem; }
  .w-8 { width: 2rem; }
  .h-6 { height: 1.5rem; }
  .h-4 { height: 1rem; }
  .h-24 { height: 6rem; }
  .bg-gradient-to-br { background-image: linear-gradient(to bottom right, var(--tw-gradient-from, #e5e7eb), var(--tw-gradient-to, #d1d5db)); }
  .from-gray-200 { --tw-gradient-from: #e5e7eb; }
  .to-gray-300 { --tw-gradient-to: #d1d5db; }
  .tabular-nums { font-variant-numeric: tabular-nums; }
  .list-none { list-style: none; }
  ul.list-none { padding-left: 0; }
`;

function waitForImages(container: HTMLElement): Promise<void> {
    const imgs = container.querySelectorAll('img');
    if (!imgs.length) return Promise.resolve();
    return Promise.all(
        [...imgs].map(
            (img) =>
                new Promise<void>((resolve) => {
                    if (img.complete) {
                        resolve();
                        return;
                    }
                    img.onload = () => resolve();
                    img.onerror = () => resolve();
                })
        )
    ).then(() => undefined);
}

function sanitizeFilename(name: string): string {
    return name.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_') || 'book';
}

function createPdfIframe(): { pageEl: HTMLDivElement; destroy: () => void } {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText =
        'position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:0;visibility:hidden;';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument;
    if (!doc) throw new Error('Could not create PDF export frame');

    doc.open();
    doc.write(
        `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${PDF_IFRAME_STYLES}</style></head><body></body></html>`
    );
    doc.close();

    const pageEl = doc.createElement('div');
    pageEl.style.width = `${PAGE_W_PX}px`;
    pageEl.style.height = `${PAGE_H_PX}px`;
    pageEl.style.overflow = 'hidden';
    pageEl.style.background = '#ffffff';
    doc.body.appendChild(pageEl);

    return {
        pageEl,
        destroy: () => {
            document.body.removeChild(iframe);
        },
    };
}

export async function exportBookToPdf(options: {
    pages: BookPage[];
    layout: BookLayoutOption;
    eventLogo?: string;
    bookTitle: string;
    onProgress?: (current: number, total: number) => void;
}): Promise<void> {
    const { pages, layout, eventLogo, bookTitle, onProgress } = options;
    if (!pages.length) throw new Error('No pages to export');

    const [{ jsPDF }, html2canvas] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
    ]);

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const { pageEl, destroy } = createPdfIframe();

    let root: Root | null = null;
    const resolvedLogo = resolveMediaUrl(eventLogo);

    try {
        root = createRoot(pageEl);

        for (let i = 0; i < pages.length; i++) {
            root.render(
                createElement(BookPageRenderer, {
                    page: pages[i],
                    layout,
                    eventLogo: resolvedLogo,
                    pageNum: i + 1,
                    totalPages: pages.length,
                })
            );

            await waitForImages(pageEl);
            await new Promise((r) => setTimeout(r, 120));

            const canvas = await html2canvas.default(pageEl, {
                scale: 2,
                useCORS: true,
                allowTaint: false,
                backgroundColor: '#ffffff',
                width: PAGE_W_PX,
                height: PAGE_H_PX,
                logging: false,
                windowWidth: PAGE_W_PX,
                windowHeight: PAGE_H_PX,
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.92);
            if (i > 0) pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, 0, A4_W_MM, A4_H_MM);
            onProgress?.(i + 1, pages.length);
        }

        pdf.save(`${sanitizeFilename(bookTitle)}.pdf`);
    } finally {
        root?.unmount();
        destroy();
    }
}
