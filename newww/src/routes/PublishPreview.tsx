import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    fetchPublishPreviewEvents,
    fetchPublishPreviewBook,
} from '../lib/api';
import { buildBookPages, formatEventDate } from '../lib/publishPreviewUtils';
import {
    BOOK_LAYOUTS,
    type BookLayoutId,
    type BookLayoutOption,
    type BookPage,
    type BookPreviewData,
    type PublishPreviewEvent,
} from '../types/publishPreview';
import {
    Newspaper, Search, BookOpen, X, ChevronLeft, ChevronRight,
    Users, Layers, Calendar, Sparkles, LayoutTemplate, Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

const PAGE_SIZE = 6;

/* ── Layout selection modal ── */
function LayoutSelectModal({
    event,
    onClose,
    onConfirm,
    loading,
}: {
    event: PublishPreviewEvent;
    onClose: () => void;
    onConfirm: (layout: BookLayoutOption, opts: { showToc: boolean; showCover: boolean }) => void;
    loading: boolean;
}) {
    const [selected, setSelected] = useState<BookLayoutId>('classic');
    const [showToc, setShowToc] = useState(true);
    const [showCover, setShowCover] = useState(true);

    const layout = BOOK_LAYOUTS.find((l) => l.id === selected)!;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl"
            >
                <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b bg-white/95 backdrop-blur-sm rounded-t-3xl sm:rounded-t-2xl">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <LayoutTemplate className="h-5 w-5 text-emerald-600" />
                            Choose Book Layout
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{event.name}</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-5 space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                        {BOOK_LAYOUTS.map((l) => (
                            <button
                                key={l.id}
                                type="button"
                                onClick={() => setSelected(l.id)}
                                className={cn(
                                    'relative text-left p-4 rounded-xl border-2 transition-all',
                                    selected === l.id
                                        ? 'border-emerald-500 bg-emerald-50/50 shadow-md'
                                        : 'border-gray-200 hover:border-emerald-200'
                                )}
                            >
                                {selected === l.id && (
                                    <span className="absolute top-2 right-2 h-5 w-5 rounded-full bg-emerald-600 flex items-center justify-center">
                                        <Check className="h-3 w-3 text-white" />
                                    </span>
                                )}
                                <div
                                    className="h-16 rounded-lg mb-3 flex items-center justify-center text-2xl font-bold text-white shadow-inner"
                                    style={{ background: l.coverBg, fontFamily: l.fontFamily }}
                                >
                                    {l.preview}
                                </div>
                                <p className="font-semibold text-sm">{l.name}</p>
                                <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{l.description}</p>
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-gray-50 border">
                        <label className="flex items-center gap-2 cursor-pointer flex-1">
                            <input
                                type="checkbox"
                                checked={showCover}
                                onChange={(e) => setShowCover(e.target.checked)}
                                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-sm font-medium">Include cover page</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer flex-1">
                            <input
                                type="checkbox"
                                checked={showToc}
                                onChange={(e) => setShowToc(e.target.checked)}
                                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-sm font-medium">Table of contents</span>
                        </label>
                    </div>

                    <div
                        className="rounded-xl p-4 border-2 border-dashed"
                        style={{ background: layout.pageBg, borderColor: layout.accent + '40' }}
                    >
                        <p className="text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: layout.accent }}>
                            Preview sample
                        </p>
                        <p className="text-lg font-bold" style={{ fontFamily: layout.fontFamily, color: '#1a1a1a' }}>
                            {event.name}
                        </p>
                        <p className="text-sm mt-2 opacity-70" style={{ fontFamily: layout.fontFamily }}>
                            Chapter opening text will appear in this style…
                        </p>
                    </div>

                    <button
                        type="button"
                        disabled={loading}
                        onClick={() => onConfirm(layout, { showToc, showCover })}
                        className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-200/50 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>Loading book…</>
                        ) : (
                            <>
                                <BookOpen className="h-4 w-4" />
                                Preview Book
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

/* ── Single book page renderer ── */
function BookPageView({
    page,
    layout,
    eventLogo,
    pageNum,
    totalPages,
}: {
    page: BookPage;
    layout: BookLayoutOption;
    eventLogo?: string;
    pageNum: number;
    totalPages: number;
}) {
    if (page.type === 'cover') {
        return (
            <div
                className="flex flex-col items-center justify-center h-full text-center px-8 py-12 text-white"
                style={{ background: layout.coverBg }}
            >
                {eventLogo && (
                    <img src={eventLogo} alt="" className="h-16 w-16 object-cover rounded-xl mb-6 shadow-lg border-2 border-white/20" />
                )}
                <p className="text-xs uppercase tracking-[0.3em] opacity-70 mb-4">Published Anthology</p>
                <h1 className="text-2xl sm:text-3xl font-bold leading-tight" style={{ fontFamily: layout.fontFamily }}>
                    {page.title}
                </h1>
                {page.subtitle && (
                    <p className="text-sm mt-4 opacity-80 max-w-md leading-relaxed">{page.subtitle}</p>
                )}
                <div className="mt-8 h-px w-16 bg-white/30" />
                <p className="text-xs mt-4 opacity-60">Tap arrows to turn pages</p>
            </div>
        );
    }

    if (page.type === 'toc') {
        return (
            <div className="h-full px-6 sm:px-10 py-8 overflow-y-auto" style={{ background: layout.pageBg }}>
                <h2
                    className="text-xl font-bold mb-6 pb-3 border-b-2"
                    style={{ fontFamily: layout.fontFamily, borderColor: layout.accent, color: layout.accent }}
                >
                    {page.title}
                </h2>
                <ul className="space-y-3">
                    {page.tocEntries?.map((entry, i) => (
                        <li key={i} className="flex items-baseline justify-between gap-2 text-sm border-b border-dashed border-gray-200 pb-2">
                            <div style={{ fontFamily: layout.fontFamily }}>
                                <span className="font-semibold">{entry.title}</span>
                                <span className="text-muted-foreground text-xs block">by {entry.author}</span>
                            </div>
                            <span className="text-xs text-muted-foreground tabular-nums">{entry.pageIndex + 1}</span>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    if (page.type === 'chapter') {
        return (
            <div
                className="flex flex-col items-center justify-center h-full text-center px-8"
                style={{ background: layout.pageBg }}
            >
                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: layout.accent }}>
                    {page.subtitle}
                </p>
                <h2 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: layout.fontFamily, color: '#1a1a1a' }}>
                    {page.title}
                </h2>
                <p className="text-sm text-muted-foreground mt-3" style={{ fontFamily: layout.fontFamily }}>
                    by {page.author}
                </p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col overflow-hidden" style={{ background: layout.pageBg }}>
            <div className="px-6 sm:px-10 pt-6 pb-3 border-b border-black/5 shrink-0">
                {page.episodeNumber && (
                    <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: layout.accent }}>
                        Episode {page.episodeNumber}
                    </p>
                )}
                <h3 className="text-base font-bold leading-snug" style={{ fontFamily: layout.fontFamily }}>
                    {page.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">by {page.author}</p>
            </div>
            <div
                className="flex-1 overflow-y-auto px-6 sm:px-10 py-5 book-prose text-[0.95rem] leading-relaxed"
                style={{ fontFamily: layout.fontFamily, color: '#2d2d2d' }}
                dangerouslySetInnerHTML={{ __html: page.html || '' }}
            />
            <div className="px-6 py-2 text-[10px] text-muted-foreground text-center border-t border-black/5 shrink-0">
                {pageNum} / {totalPages}
            </div>
        </div>
    );
}

/* ── Full-screen book viewer ── */
function BookViewer({
    data,
    layout,
    pages,
    onClose,
}: {
    data: BookPreviewData;
    layout: BookLayoutOption;
    pages: BookPage[];
    onClose: () => void;
}) {
    const [pageIdx, setPageIdx] = useState(0);
    const total = pages.length;
    const page = pages[pageIdx];

    const goPrev = () => setPageIdx((i) => Math.max(0, i - 1));
    const goNext = () => setPageIdx((i) => Math.min(total - 1, i + 1));

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex flex-col bg-[#1a1208]/90 backdrop-blur-md"
        >
            <div className="flex items-center justify-between px-4 py-3 shrink-0">
                <div className="min-w-0">
                    <p className="text-white/90 text-sm font-semibold truncate">{data.event.name}</p>
                    <p className="text-white/50 text-[10px]">
                        {data.stats.writers} writers · {data.stats.episodes} episodes · {layout.name} layout
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="flex-1 flex items-center justify-center px-2 sm:px-8 pb-4 min-h-0">
                <button
                    type="button"
                    onClick={goPrev}
                    disabled={pageIdx === 0}
                    className="hidden sm:flex p-3 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-20 transition-colors shrink-0 mr-3"
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={pageIdx}
                        initial={{ opacity: 0, x: 30, rotateY: -4 }}
                        animate={{ opacity: 1, x: 0, rotateY: 0 }}
                        exit={{ opacity: 0, x: -30, rotateY: 4 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className="w-full max-w-lg h-[min(72vh,640px)] rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10"
                    >
                        <BookPageView
                            page={page}
                            layout={layout}
                            eventLogo={data.event.logo_url}
                            pageNum={pageIdx + 1}
                            totalPages={total}
                        />
                    </motion.div>
                </AnimatePresence>

                <button
                    type="button"
                    onClick={goNext}
                    disabled={pageIdx >= total - 1}
                    className="hidden sm:flex p-3 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-20 transition-colors shrink-0 ml-3"
                >
                    <ChevronRight className="h-6 w-6" />
                </button>
            </div>

            <div className="flex items-center justify-center gap-4 px-4 pb-5 shrink-0">
                <button
                    type="button"
                    onClick={goPrev}
                    disabled={pageIdx === 0}
                    className="sm:hidden p-2.5 rounded-full bg-white/10 text-white disabled:opacity-20"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-1 max-w-[200px] overflow-x-auto">
                    {pages.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setPageIdx(i)}
                            className={cn(
                                'h-1.5 rounded-full transition-all shrink-0',
                                i === pageIdx ? 'w-6 bg-emerald-400' : 'w-1.5 bg-white/30'
                            )}
                        />
                    ))}
                </div>
                <button
                    type="button"
                    onClick={goNext}
                    disabled={pageIdx >= total - 1}
                    className="sm:hidden p-2.5 rounded-full bg-white/10 text-white disabled:opacity-20"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>
        </motion.div>
    );
}

/* ── Main page ── */
export default function PublishPreview() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [layoutEvent, setLayoutEvent] = useState<PublishPreviewEvent | null>(null);
    const [bookData, setBookData] = useState<BookPreviewData | null>(null);
    const [bookLayout, setBookLayout] = useState<BookLayoutOption | null>(null);
    const [bookOptions, setBookOptions] = useState({ showToc: true, showCover: true });
    const [loadingBook, setLoadingBook] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['publish-preview-events', page, search],
        queryFn: () => fetchPublishPreviewEvents(page, PAGE_SIZE, search),
    });

    const events = data?.events ?? [];
    const totalPages = data?.totalPages ?? 1;
    const total = data?.total ?? 0;

    const bookPages = useMemo(() => {
        if (!bookData || !bookLayout) return [];
        return buildBookPages(bookData, bookLayout, bookOptions);
    }, [bookData, bookLayout, bookOptions]);

    const handleOpenLayout = (ev: PublishPreviewEvent) => setLayoutEvent(ev);

    const handleConfirmLayout = async (
        layout: BookLayoutOption,
        opts: { showToc: boolean; showCover: boolean }
    ) => {
        if (!layoutEvent) return;
        setLoadingBook(true);
        try {
            const data = await fetchPublishPreviewBook(layoutEvent.eid);
            setBookData(data);
            setBookLayout(layout);
            setBookOptions(opts);
            setLayoutEvent(null);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to load book preview');
            setLayoutEvent(null);
        } finally {
            setLoadingBook(false);
        }
    };

    return (
        <div className="space-y-5 sm:space-y-6 pb-8">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3"
            >
                <div className="p-2.5 sm:p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl shrink-0 shadow-sm">
                    <Newspaper className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                </div>
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Publish Preview</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Book events with approved, proofread episodes — select a layout to preview.
                    </p>
                </div>
            </motion.div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search book events…"
                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-shadow"
                />
            </div>

            <p className="text-xs text-muted-foreground">
                {total} book event{total !== 1 ? 's' : ''} ready to publish
            </p>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-56 rounded-2xl bg-gray-100 animate-pulse" />
                    ))}
                </div>
            ) : events.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed rounded-2xl bg-gray-50/50">
                    <BookOpen className="h-14 w-14 mb-4 opacity-20" />
                    <p className="font-semibold">No book events ready</p>
                    <p className="text-xs mt-1 text-center max-w-sm px-4">
                        Events need is_book=true, is_app=false, episode_wise=true, and content marked Proof Read Done.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                    {events.map((ev, i) => (
                        <motion.button
                            key={ev.eid}
                            type="button"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ y: -4, scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleOpenLayout(ev)}
                            className="group text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all overflow-hidden"
                        >
                            <div className="h-28 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 relative overflow-hidden">
                                {ev.logo_url ? (
                                    <img
                                        src={ev.logo_url}
                                        alt=""
                                        className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity"
                                    />
                                ) : null}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                <div className="absolute bottom-3 left-4 right-4">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 bg-black/30 px-2 py-0.5 rounded-full">
                                        Book · Episode Wise
                                    </span>
                                    <h3 className="text-white font-bold text-lg leading-tight mt-1 line-clamp-2">
                                        {ev.name}
                                    </h3>
                                </div>
                            </div>
                            <div className="p-4 space-y-3">
                                {ev.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2">{ev.description}</p>
                                )}
                                <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">
                                        <Users className="h-3 w-3" /> {ev.writerCount} writers
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">
                                        <Layers className="h-3 w-3" /> {ev.episodeCount} episodes
                                    </span>
                                    {ev.st_dt && (
                                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                            <Calendar className="h-3 w-3" /> {formatEventDate(ev.st_dt)}
                                        </span>
                                    )}
                                </div>
                                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 group-hover:text-emerald-700">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Select layout &amp; preview
                                    <ChevronRight className="h-3.5 w-3.5 ml-auto group-hover:translate-x-0.5 transition-transform" />
                                </span>
                            </div>
                        </motion.button>
                    ))}
                </div>
            )}

            {!isLoading && totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
                    <p className="text-xs text-muted-foreground">
                        Page {page} of {totalPages} · {total} events
                    </p>
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-lg border hover:bg-gray-100 disabled:opacity-30 transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            const pg = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                            if (pg > totalPages) return null;
                            return (
                                <button
                                    key={pg}
                                    type="button"
                                    onClick={() => setPage(pg)}
                                    className={cn(
                                        'w-8 h-8 text-xs font-semibold rounded-lg transition-colors',
                                        pg === page ? 'bg-emerald-600 text-white' : 'border text-gray-500 hover:bg-gray-100'
                                    )}
                                >
                                    {pg}
                                </button>
                            );
                        })}
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 rounded-lg border hover:bg-gray-100 disabled:opacity-30 transition-colors"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {layoutEvent && (
                    <LayoutSelectModal
                        event={layoutEvent}
                        loading={loadingBook}
                        onClose={() => !loadingBook && setLayoutEvent(null)}
                        onConfirm={handleConfirmLayout}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {bookData && bookLayout && bookPages.length > 0 && (
                    <BookViewer
                        data={bookData}
                        layout={bookLayout}
                        pages={bookPages}
                        onClose={() => { setBookData(null); setBookLayout(null); }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
