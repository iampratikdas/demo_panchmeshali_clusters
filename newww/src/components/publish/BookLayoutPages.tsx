import type { BookLayoutId, BookLayoutOption, BookPage } from '../../types/publishPreview';
import { resolveMediaUrl } from '../../lib/publishPreviewUtils';
import { cn } from '../../lib/utils';
import { useState } from 'react';

/* ── Image with resolved URL + fallback ── */
function BookCoverImage({
    src,
    className,
    imgClassName,
    grayscale,
}: {
    src?: string;
    className?: string;
    imgClassName?: string;
    grayscale?: boolean;
}) {
    const resolved = resolveMediaUrl(src);
    const [failed, setFailed] = useState(false);
    const showImg = Boolean(resolved) && !failed;

    return (
        <div className={cn('relative overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300', className)}>
            {showImg ? (
                <img
                    src={resolved}
                    alt=""
                    crossOrigin="anonymous"
                    className={cn('absolute inset-0 w-full h-full object-cover', grayscale && 'grayscale', imgClassName)}
                    onError={() => setFailed(true)}
                />
            ) : null}
        </div>
    );
}

/* ── Mini thumbnails for layout picker ── */
export function LayoutThumbnail({
    layoutId,
    title,
    accent,
}: {
    layoutId: BookLayoutId;
    title: string;
    accent: string;
}) {
    const base = 'w-full h-24 rounded-lg overflow-hidden border border-black/5 shadow-sm relative';

    if (layoutId === 'textbook') {
        return (
            <div className={cn(base, 'bg-white p-2 flex flex-col')}>
                <div className="text-[6px] font-bold leading-tight line-clamp-2">{title}</div>
                <div className="flex-1 my-1 relative rounded overflow-hidden bg-gray-200">
                    <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full opacity-80" style={{ background: accent }} />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gray-600 opacity-60" />
                </div>
                <div className="text-[5px] font-serif" style={{ color: accent }}>Author Name</div>
            </div>
        );
    }
    if (layoutId === 'spread') {
        return (
            <div className={cn(base, 'bg-white p-2')}>
                <div className="flex gap-1 h-full">
                    <div className="flex-1 border-r border-gray-200 pr-1">
                        <div className="h-2 bg-gray-100 mb-1" />
                        <div className="space-y-0.5">{[1, 2, 3].map(i => <div key={i} className="h-0.5 bg-gray-200" />)}</div>
                    </div>
                    <div className="flex-1 pl-1">
                        <div className="h-2 mb-1" style={{ background: accent, opacity: 0.3 }} />
                        <div className="space-y-0.5">{[1, 2, 3].map(i => <div key={i} className="h-0.5 bg-gray-200" />)}</div>
                    </div>
                </div>
            </div>
        );
    }
    if (layoutId === 'outline') {
        return (
            <div className={cn(base, 'bg-[#fafafa] flex flex-col items-center justify-center p-2 text-center')}>
                <div className="text-[7px] font-bold font-serif leading-tight line-clamp-2">{title}</div>
                <div className="text-[4px] text-gray-500 mt-1">Subtitle line</div>
                <div className="text-[5px] mt-2 self-end text-gray-600">Author</div>
            </div>
        );
    }
    if (layoutId === 'literary') {
        return (
            <div className={cn(base, 'bg-white flex flex-col items-center p-2')}>
                <div className="text-[5px] text-gray-400">✦</div>
                <div className="text-[6px] font-bold tracking-wider mt-0.5">TITLE</div>
                <div className="w-full h-px bg-black/20 my-1" />
                <div className="text-[8px] font-bold float-left mr-0.5">T</div>
                <div className="space-y-0.5 flex-1 w-full">{[1, 2].map(i => <div key={i} className="h-0.5 bg-gray-200" />)}</div>
            </div>
        );
    }
    if (layoutId === 'memoir') {
        return (
            <div className={cn(base, 'bg-white p-2')}>
                <div className="text-[4px] tracking-widest text-center">CHAPTER 1</div>
                <div className="text-[6px] font-bold text-center leading-tight mt-0.5 line-clamp-2">{title}</div>
                <div className="h-4 bg-gray-100 my-1 rounded-sm" />
                <div className="space-y-0.5">{[1, 2, 3].map(i => <div key={i} className="h-0.5 bg-gray-200" />)}</div>
            </div>
        );
    }
    return (
        <div className={cn(base, 'bg-white p-2')}>
            <div className="text-[5px] font-black leading-none line-clamp-2 uppercase">{title}</div>
            <div className="h-6 bg-gray-300 my-1 rounded-sm" />
            <div className="grid grid-cols-2 gap-0.5">{[1, 2, 3, 4].map(i => <div key={i} className="h-0.5 bg-gray-200" />)}</div>
        </div>
    );
}

/* ── Page footer ── */
function PageFooter({
    layout,
    page,
    pageNum,
    side = 'right',
}: {
    layout: BookLayoutOption;
    page: BookPage;
    pageNum: number;
    side?: 'left' | 'right';
}) {
    if (layout.id === 'spread') {
        return (
            <div className="flex items-center justify-between px-8 py-3 text-[10px] text-gray-500 border-t border-gray-100 shrink-0">
                {side === 'left' ? (
                    <>
                        <span>{pageNum}</span>
                        <span className="italic">{page.author}</span>
                    </>
                ) : (
                    <>
                        <span className="truncate max-w-[50%]">{page.bookTitle}</span>
                        <span>{pageNum}</span>
                    </>
                )}
            </div>
        );
    }
    if (layout.id === 'outline') {
        return (
            <div className="flex items-center justify-between px-10 py-3 text-[10px] text-gray-400 shrink-0">
                <span className="truncate">{page.bookTitle}</span>
                <span>{pageNum}</span>
            </div>
        );
    }
    return (
        <div className="text-center py-3 text-[11px] text-gray-400 shrink-0">{pageNum}</div>
    );
}

/* ── Cover pages ── */
function CoverTextbook({ page, layout, eventLogo }: { page: BookPage; layout: BookLayoutOption; eventLogo?: string }) {
    const img = page.coverImage || eventLogo;
    const logo = resolveMediaUrl(eventLogo);
    const [logoFailed, setLogoFailed] = useState(false);

    return (
        <div className="h-full flex flex-col bg-white overflow-hidden">
            <div className="px-8 pt-8 pb-4">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight" style={{ fontFamily: layout.fontFamily }}>
                    {page.title}
                </h1>
                {page.subtitle && (
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed max-w-sm">{page.subtitle}</p>
                )}
            </div>
            <div className="relative mx-6 flex-1 min-h-[140px] rounded-lg overflow-hidden">
                <BookCoverImage src={img} className="absolute inset-0 rounded-lg" />
                <svg className="absolute top-0 left-0 w-full h-12 z-10 pointer-events-none" viewBox="0 0 400 48" preserveAspectRatio="none">
                    <path d="M0,48 Q100,0 200,24 T400,48 L400,0 L0,0 Z" fill={layout.accent} opacity="0.85" />
                </svg>
                <svg className="absolute bottom-0 left-0 w-full h-10 z-10 pointer-events-none" viewBox="0 0 400 40" preserveAspectRatio="none">
                    <path d="M0,0 Q150,40 300,10 T400,0 L400,40 L0,40 Z" fill="#4a4a4a" opacity="0.7" />
                </svg>
            </div>
            <div className="px-8 py-6 flex items-end justify-between gap-4">
                <div>
                    <p className="text-[10px] text-gray-500">First Edition · {new Date().getFullYear()}</p>
                    {page.author && (
                        <p className="text-lg font-serif mt-1" style={{ color: layout.accent, fontFamily: layout.titleFont }}>
                            {page.author}
                        </p>
                    )}
                </div>
                {logo && !logoFailed ? (
                    <img
                        src={logo}
                        alt=""
                        crossOrigin="anonymous"
                        className="h-10 w-10 object-cover rounded border border-gray-200"
                        onError={() => setLogoFailed(true)}
                    />
                ) : (
                    <div className="text-[9px] text-gray-400 border border-gray-200 px-2 py-1 rounded">LOGO</div>
                )}
            </div>
        </div>
    );
}

function CoverOutline({ page, layout }: { page: BookPage; layout: BookLayoutOption }) {
    return (
        <div className="h-full flex flex-col items-center justify-center px-10 text-center" style={{ background: layout.pageBg }}>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight" style={{ fontFamily: layout.titleFont }}>
                {page.title}
            </h1>
            {page.subtitle && (
                <p className="text-sm text-gray-600 mt-4 leading-relaxed max-w-xs">{page.subtitle}</p>
            )}
            {page.author && (
                <p className="text-base mt-8 self-end w-full text-right font-serif text-gray-700">{page.author}</p>
            )}
        </div>
    );
}

function CoverLiterary({ page, layout }: { page: BookPage; layout: BookLayoutOption }) {
    return (
        <div className="h-full flex flex-col items-center justify-center px-10 text-center bg-white">
            <div className="text-4xl mb-4 opacity-30">🌿</div>
            <h1 className="text-lg sm:text-xl font-bold tracking-[0.2em] uppercase" style={{ fontFamily: layout.titleFont }}>
                {page.title}
            </h1>
            {page.subtitle && (
                <p className="text-sm italic text-gray-600 mt-3">{page.subtitle}</p>
            )}
            <div className="w-24 h-px bg-black/30 mt-6" />
        </div>
    );
}

function CoverMagazine({ page, layout, eventLogo }: { page: BookPage; layout: BookLayoutOption; eventLogo?: string }) {
    const img = page.coverImage || eventLogo;
    return (
        <div className="h-full flex flex-col bg-white overflow-hidden">
            <div className="p-6 flex-1 flex flex-col">
                <p className="text-[9px] tracking-widest text-gray-500 uppercase">Issue 1 / Anthology</p>
                <h1 className="text-xl sm:text-2xl font-black uppercase leading-none mt-3 tracking-tight" style={{ fontFamily: layout.titleFont }}>
                    {page.title}
                </h1>
                <BookCoverImage
                    src={img}
                    className="mt-4 aspect-square max-h-40 rounded-sm"
                    grayscale
                />
                {page.author && (
                    <p className="text-2xl font-black uppercase mt-4 tracking-tighter opacity-20" style={{ fontFamily: layout.titleFont }}>
                        {page.author}
                    </p>
                )}
            </div>
        </div>
    );
}

function CoverDefault({ page, layout, eventLogo }: { page: BookPage; layout: BookLayoutOption; eventLogo?: string }) {
    const img = page.coverImage || eventLogo;
    return (
        <div
            className="h-full flex flex-col items-center justify-center text-center px-8 py-10 text-white relative overflow-hidden"
            style={{ background: `linear-gradient(145deg, ${layout.secondary} 0%, #1a1a1a 100%)` }}
        >
            {img && (
                <BookCoverImage src={img} className="absolute inset-0 opacity-30" />
            )}
            <div className="relative z-10">
                <p className="text-[10px] uppercase tracking-[0.25em] opacity-70 mb-3">Published Collection</p>
                <h1 className="text-2xl font-bold leading-tight" style={{ fontFamily: layout.titleFont }}>{page.title}</h1>
                {page.subtitle && <p className="text-sm mt-3 opacity-80 max-w-xs mx-auto">{page.subtitle}</p>}
            </div>
        </div>
    );
}

/* ── Chapter pages ── */
function ChapterSpread({ page, layout, pageNum }: { page: BookPage; layout: BookLayoutOption; pageNum: number }) {
    return (
        <div className="h-full flex flex-col" style={{ background: layout.pageBg }}>
            <div className="flex-1 flex items-start px-8 pt-10">
                <div className="w-12 h-20 bg-gray-100 flex items-center justify-center shrink-0 mr-4">
                    <span className="text-3xl font-light text-gray-400">{page.chapterIndex || 1}</span>
                </div>
                <div>
                    <h2 className="text-xl sm:text-2xl font-serif leading-tight" style={{ color: layout.accent, fontFamily: layout.titleFont }}>
                        {page.title}
                    </h2>
                    <p className="text-sm text-gray-500 mt-2">by {page.author}</p>
                </div>
            </div>
            <PageFooter layout={layout} page={page} pageNum={pageNum} side="right" />
        </div>
    );
}

function ChapterMemoir({ page, layout, pageNum }: { page: BookPage; layout: BookLayoutOption; pageNum: number }) {
    return (
        <div className="h-full flex flex-col px-8 pt-12" style={{ background: layout.pageBg }}>
            <p className="text-xs tracking-[0.2em] text-center text-gray-600 uppercase">
                Chapter {page.chapterIndex || page.episodeNumber || 1}
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-center mt-4 leading-tight tracking-tight" style={{ fontFamily: layout.titleFont }}>
                {page.title}
            </h2>
            <p className="text-sm italic text-center text-gray-500 mt-6 max-w-md mx-auto leading-relaxed">
                A story by {page.author}
            </p>
            {page.coverImage && (
                <BookCoverImage src={page.coverImage} className="mt-8 mx-auto w-full max-w-xs aspect-video rounded" />
            )}
            <div className="flex-1" />
            <PageFooter layout={layout} page={page} pageNum={pageNum} />
        </div>
    );
}

function ChapterLiterary({ page, layout, pageNum }: { page: BookPage; layout: BookLayoutOption; pageNum: number }) {
    return (
        <div className="h-full flex flex-col items-center justify-center px-10 text-center" style={{ background: layout.pageBg }}>
            <p className="text-xs tracking-[0.3em] uppercase text-gray-500 mb-2">Chapter {page.chapterIndex || 1}</p>
            <h2 className="text-xl font-bold tracking-wide uppercase" style={{ fontFamily: layout.titleFont }}>{page.title}</h2>
            <p className="text-sm italic text-gray-600 mt-2">Follow the journey within</p>
            <div className="w-20 h-px bg-black/25 mt-6" />
            <p className="text-sm text-gray-500 mt-4">by {page.author}</p>
            <PageFooter layout={layout} page={page} pageNum={pageNum} />
        </div>
    );
}

function ChapterDefault({ page, layout, pageNum }: { page: BookPage; layout: BookLayoutOption; pageNum: number }) {
    return (
        <div className="h-full flex flex-col items-center justify-center px-10 text-center" style={{ background: layout.pageBg }}>
            <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: layout.accent }}>{page.subtitle}</p>
            <h2 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: layout.titleFont }}>{page.title}</h2>
            <p className="text-sm text-gray-500 mt-3">by {page.author}</p>
            <PageFooter layout={layout} page={page} pageNum={pageNum} />
        </div>
    );
}

/* ── Content pages ── */
function ContentSpread({ page, layout, pageNum }: { page: BookPage; layout: BookLayoutOption; pageNum: number }) {
    const side = pageNum % 2 === 0 ? 'left' : 'right';
    return (
        <div className="h-full flex flex-col overflow-hidden" style={{ background: layout.pageBg }}>
            <div className="px-8 pt-6">
                <div className="py-2 px-3 mb-4" style={{ background: layout.secondary }}>
                    <span className="text-sm font-semibold" style={{ color: layout.accent }}>{page.title}</span>
                </div>
            </div>
            <div
                className="flex-1 overflow-y-auto px-8 pb-4 book-prose text-[0.9rem] leading-[1.85] text-justify"
                style={{ fontFamily: layout.fontFamily, color: '#2d2d2d' }}
                dangerouslySetInnerHTML={{ __html: page.html || '' }}
            />
            <PageFooter layout={layout} page={page} pageNum={pageNum} side={side} />
        </div>
    );
}

function ContentLiterary({ page, layout, pageNum }: { page: BookPage; layout: BookLayoutOption; pageNum: number }) {
    return (
        <div className="h-full flex flex-col overflow-hidden px-10 pt-10" style={{ background: layout.pageBg }}>
            <div className="flex-1 overflow-y-auto">
                <p className="text-sm font-bold tracking-[0.15em] uppercase text-center mb-2">{page.title}</p>
                <div className="w-full h-px bg-black/20 mb-6" />
                <div
                    className="book-prose literary-drop-cap text-[0.95rem] leading-[1.9] text-justify"
                    style={{ fontFamily: layout.fontFamily }}
                    dangerouslySetInnerHTML={{ __html: page.html || '' }}
                />
            </div>
            <PageFooter layout={layout} page={page} pageNum={pageNum} />
        </div>
    );
}

function ContentMagazine({ page, layout, pageNum }: { page: BookPage; layout: BookLayoutOption; pageNum: number }) {
    return (
        <div className="h-full flex flex-col overflow-hidden" style={{ background: layout.pageBg }}>
            <div className="px-6 pt-5 pb-2 border-b-2 border-black">
                <p className="text-[9px] uppercase tracking-widest">{page.author}</p>
                <h3 className="text-base font-black uppercase leading-tight mt-1" style={{ fontFamily: layout.titleFont }}>
                    {page.title}
                </h3>
            </div>
            {page.coverImage && (
                <BookCoverImage src={page.coverImage} className="mx-6 mt-4 h-28" grayscale />
            )}
            <div
                className="flex-1 overflow-y-auto px-6 py-4 book-prose magazine-columns text-[0.85rem] leading-relaxed"
                style={{ fontFamily: layout.fontFamily }}
                dangerouslySetInnerHTML={{ __html: page.html || '' }}
            />
            <div className="px-6 py-2 flex justify-between text-[9px] text-gray-500 border-t">
                <span>{page.bookTitle}</span>
                <span>{pageNum}</span>
            </div>
        </div>
    );
}

function ContentOutline({ page, layout, pageNum }: { page: BookPage; layout: BookLayoutOption; pageNum: number }) {
    return (
        <div className="h-full flex flex-col overflow-hidden" style={{ background: layout.pageBg }}>
            <div className="px-10 pt-8 pb-2 text-right">
                <p className="text-[10px] uppercase tracking-widest text-gray-500">{page.author}</p>
            </div>
            <div className="px-10 pb-2">
                <p className="text-xs text-gray-500">CHAPTER {page.chapterIndex || page.episodeNumber || 1}</p>
                <h3 className="text-xl font-bold mt-1" style={{ fontFamily: layout.titleFont }}>{page.title}</h3>
            </div>
            <div
                className="flex-1 overflow-y-auto px-10 py-4 book-prose text-[0.92rem] leading-[1.85] text-justify"
                style={{ fontFamily: layout.fontFamily }}
                dangerouslySetInnerHTML={{ __html: page.html || '' }}
            />
            <PageFooter layout={layout} page={page} pageNum={pageNum} />
        </div>
    );
}

function ContentDefault({ page, layout, pageNum }: { page: BookPage; layout: BookLayoutOption; pageNum: number }) {
    const proseClass = layout.id === 'memoir'
        ? 'book-prose memoir-drop-cap text-[0.95rem] leading-[1.9] text-justify'
        : 'book-prose text-[0.95rem] leading-relaxed text-justify';

    return (
        <div className="h-full flex flex-col overflow-hidden" style={{ background: layout.pageBg }}>
            {layout.id === 'memoir' && (
                <div className="px-8 pt-8 text-center shrink-0">
                    <p className="text-[10px] tracking-[0.15em] uppercase">Episode {page.episodeNumber || '1'}</p>
                </div>
            )}
            <div className="flex-1 overflow-y-auto px-8 py-4">
                <div
                    className={proseClass}
                    style={{ fontFamily: layout.fontFamily }}
                    dangerouslySetInnerHTML={{ __html: page.html || '' }}
                />
            </div>
            <PageFooter layout={layout} page={page} pageNum={pageNum} />
        </div>
    );
}

/* ── TOC ── */
function TocPage({ page, layout }: { page: BookPage; layout: BookLayoutOption }) {
    return (
        <div className="h-full px-8 sm:px-10 py-8 overflow-y-auto" style={{ background: layout.pageBg }}>
            <h2
                className="text-lg font-bold mb-6 pb-2 border-b-2"
                style={{ fontFamily: layout.titleFont, borderColor: layout.accent, color: layout.accent }}
            >
                {page.title || 'Contents'}
            </h2>
            <ul className="space-y-3">
                {page.tocEntries?.map((entry, i) => (
                    <li key={i} className="flex items-baseline justify-between gap-2 text-sm border-b border-dotted border-gray-200 pb-2">
                        <div style={{ fontFamily: layout.fontFamily }}>
                            <span className="font-semibold">{entry.title}</span>
                            <span className="text-gray-500 text-xs block italic">by {entry.author}</span>
                        </div>
                        <span className="text-xs text-gray-400 tabular-nums">{entry.pageIndex + 1}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/* ── Main export ── */
export function BookPageRenderer({
    page,
    layout,
    eventLogo,
    pageNum,
    totalPages: _totalPages,
}: {
    page: BookPage;
    layout: BookLayoutOption;
    eventLogo?: string;
    pageNum: number;
    totalPages: number;
}) {
    if (page.type === 'cover') {
        switch (layout.id) {
            case 'textbook': return <CoverTextbook page={page} layout={layout} eventLogo={eventLogo} />;
            case 'outline': return <CoverOutline page={page} layout={layout} />;
            case 'literary': return <CoverLiterary page={page} layout={layout} />;
            case 'magazine': return <CoverMagazine page={page} layout={layout} eventLogo={eventLogo} />;
            default: return <CoverDefault page={page} layout={layout} eventLogo={eventLogo} />;
        }
    }

    if (page.type === 'toc') {
        return <TocPage page={page} layout={layout} />;
    }

    if (page.type === 'chapter') {
        switch (layout.id) {
            case 'spread': return <ChapterSpread page={page} layout={layout} pageNum={pageNum} />;
            case 'memoir': return <ChapterMemoir page={page} layout={layout} pageNum={pageNum} />;
            case 'literary': return <ChapterLiterary page={page} layout={layout} pageNum={pageNum} />;
            default: return <ChapterDefault page={page} layout={layout} pageNum={pageNum} />;
        }
    }

    switch (layout.id) {
        case 'spread': return <ContentSpread page={page} layout={layout} pageNum={pageNum} />;
        case 'literary': return <ContentLiterary page={page} layout={layout} pageNum={pageNum} />;
        case 'magazine': return <ContentMagazine page={page} layout={layout} pageNum={pageNum} />;
        case 'outline': return <ContentOutline page={page} layout={layout} pageNum={pageNum} />;
        default: return <ContentDefault page={page} layout={layout} pageNum={pageNum} />;
    }
}

export function LayoutSamplePreview({
    layout,
    eventName,
    eventLogo,
    authorName,
}: {
    layout: BookLayoutOption;
    eventName: string;
    eventLogo?: string;
    authorName?: string;
}) {
    const resolvedLogo = resolveMediaUrl(eventLogo);
    const author = authorName || 'Author Name';

    return (
        <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg overflow-hidden border shadow-sm aspect-[3/4]">
                <BookPageRenderer
                    page={{
                        type: 'cover',
                        title: eventName,
                        subtitle: 'Sample edition preview',
                        author,
                        coverImage: resolvedLogo,
                    }}
                    layout={layout}
                    eventLogo={resolvedLogo}
                    pageNum={1}
                    totalPages={2}
                />
            </div>
            <div className="rounded-lg overflow-hidden border shadow-sm aspect-[3/4]">
                <BookPageRenderer
                    page={{
                        type: 'content',
                        title: 'Sample Chapter',
                        author,
                        bookTitle: eventName,
                        coverImage: resolvedLogo,
                        html: '<p>The opening paragraph of your proofread content will appear here with professional typography, justified alignment, and generous margins—just like a published book.</p>',
                        chapterIndex: 1,
                    }}
                    layout={layout}
                    eventLogo={resolvedLogo}
                    pageNum={2}
                    totalPages={2}
                />
            </div>
        </div>
    );
}
