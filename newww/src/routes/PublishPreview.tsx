import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchContents } from '../lib/api';
import {
    Newspaper, Search, BookOpen, Feather, Star, Eye, Heart,
    X, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

/* ── Types ── */
type PreviewCard = {
    id: string;
    title: string;
    author: string;
    type: string;
    fullContent: string;
    excerpt: string;
    wordCount?: number;
    genre?: string;
    createdAt: string;
    likes: number;
    views: number;
    rating: number;
};

const PAGE_SIZE = 6;

function stableNum(id: string, salt: number, max: number) {
    let h = salt;
    for (const c of id) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
    return Math.abs(h) % max;
}

/* ─────────────────────────────────────────────────────────
   BookReader — full-screen, book-like reading modal
───────────────────────────────────────────────────────── */
function BookReader({ item, onClose }: { item: PreviewCard; onClose: () => void }) {
    const isPoem = item.type === 'poem';
    const htmlContent = item.fullContent || item.excerpt || '<p>No content available.</p>';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
            style={{ background: 'rgba(24,18,10,0.85)', backdropFilter: 'blur(6px)' }}
            onClick={onClose}
        >
            {/* Book wrapper — stops click propagation */}
            <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0, y: 30 }}
                transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                onClick={e => e.stopPropagation()}
                className="relative w-full max-w-2xl flex flex-col rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
                style={{ background: '#fdf8f0', minHeight: '520px', maxHeight: '90vh' }}
            >
                {/* ── Spine accent ── */}
                <div className={cn(
                    'h-2 w-full',
                    isPoem
                        ? 'bg-gradient-to-r from-pink-400 via-rose-400 to-pink-600'
                        : 'bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-700'
                )} />

                {/* ── Header ── */}
                <div className="flex items-start justify-between px-8 pt-6 pb-4 border-b border-amber-100">
                    <div className="flex items-center gap-2.5">
                        <div className={cn(
                            'p-1.5 rounded-lg',
                            isPoem ? 'bg-pink-100 text-pink-600' : 'bg-indigo-100 text-indigo-600'
                        )}>
                            {isPoem ? <Feather className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                        </div>
                        <div>
                            <p className={cn(
                                'text-[10px] font-black uppercase tracking-widest',
                                isPoem ? 'text-pink-400' : 'text-indigo-400'
                            )}>
                                {isPoem ? 'Poem' : 'Story'}{item.genre ? ` · ${item.genre}` : ''}
                            </p>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight"
                                style={{ fontFamily: 'Georgia, serif' }}>
                                {item.title}
                            </h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-amber-100 hover:text-gray-700 transition-colors mt-0.5"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Author + meta */}
                <div className="flex items-center gap-4 px-8 py-3 text-xs text-gray-500 border-b border-amber-100/60">
                    <span className="font-semibold text-gray-700" style={{ fontFamily: 'Georgia, serif' }}>
                        by {item.author}
                    </span>
                    <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1 text-amber-500 font-semibold">
                        <Star className="h-3.5 w-3.5 fill-amber-400" />{item.rating}
                    </span>
                    <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />{item.views.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5 text-rose-400" />{item.likes}
                    </span>
                </div>

                {/* ── Book page content: renders raw HTML ── */}
                <div className="flex-1 overflow-y-auto px-10 sm:px-16 py-8 relative"
                    style={{ background: 'linear-gradient(to bottom, #fdf8f0 0%, #fef9f2 100%)' }}>

                    {/* Subtle left rule for book feel */}
                    <div className="absolute left-8 top-0 bottom-0 w-px bg-amber-100 pointer-events-none" />

                    <div
                        className={cn('book-prose', isPoem && 'book-prose--poem')}
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                        style={{
                            fontFamily: 'Georgia, serif',
                            fontSize: '1.05rem',
                            lineHeight: '1.9',
                            color: '#2d2d2d',
                        }}
                    />
                </div>

                {/* ── Footer ── */}
                <div className="flex items-center justify-end px-8 py-4 border-t border-amber-100 bg-amber-50/60">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                    >
                        Close ✓
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

/* ─────────────────────────────────────────────────────────
   PublishPreview — main page
───────────────────────────────────────────────────────── */
export default function PublishPreview() {
    const [search, setSearch] = useState('');
    const [typeFilter, setType] = useState<'all' | 'story' | 'poem'>('all');
    const [page, setPage] = useState(1);
    const [reading, setReading] = useState<PreviewCard | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['contents', 1, 50],
        queryFn: () => fetchContents(1, 50),
    });

    const cards: PreviewCard[] = useMemo(() =>
        (data?.data ?? []).map(c => ({
            id: c.id,
            title: c.title,
            author: c.authorName ?? 'Unknown',
            type: c.type,
            fullContent: (c as any).fullContent ?? (c as any).content ?? '',
            excerpt: ((c as any).content ?? '').replace(/<[^>]+>/g, '').slice(0, 200),
            wordCount: (c as any).wordCount,
            genre: (c as any).genre,
            createdAt: c.createdAt,
            likes: stableNum(c.id, 7, 500) + 10,
            views: stableNum(c.id, 13, 5000) + 100,
            rating: parseFloat(((stableNum(c.id, 17, 20) / 10) + 3).toFixed(1)),
        })),
        [data]);

    const filtered = useMemo(() => cards.filter(c => {
        const q = search.toLowerCase();
        return (!q || c.title.toLowerCase().includes(q) || c.author.toLowerCase().includes(q))
            && (typeFilter === 'all' || c.type === typeFilter);
    }), [cards, search, typeFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-start gap-3">
                <div className="p-2.5 sm:p-3 bg-emerald-100 rounded-xl shrink-0">
                    <Newspaper className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                </div>
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Publish Preview</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Click any card to open the full book reading view.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <input
                        type="text" value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search by title or author…"
                        className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-shadow"
                    />
                </div>
                <div className="flex items-center gap-2">
                    {(['all', 'story', 'poem'] as const).map(t => (
                        <button key={t} onClick={() => { setType(t); setPage(1); }}
                            className={cn('px-4 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all',
                                typeFilter === t
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-white border border-gray-200 text-gray-500 hover:border-emerald-300'
                            )}>
                            {t === 'all' ? 'All' : t === 'story' ? '📖 Stories' : '✍️ Poems'}
                        </button>
                    ))}
                </div>
            </div>
            <p className="text-xs text-muted-foreground -mt-2">{filtered.length} item{filtered.length !== 1 ? 's' : ''}</p>

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {[...Array(6)].map((_, i) => <div key={i} className="h-52 rounded-2xl bg-gray-100 animate-pulse" />)}
                </div>
            ) : pageItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-muted-foreground border-2 border-dashed rounded-2xl">
                    <Newspaper className="h-14 w-14 mb-4 opacity-20" />
                    <p className="font-semibold">No content matches</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {pageItems.map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            onClick={() => setReading(item)}
                            className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all cursor-pointer overflow-hidden"
                        >
                            <div className={cn('h-1.5 w-full',
                                item.type === 'story'
                                    ? 'bg-gradient-to-r from-indigo-400 to-blue-500'
                                    : 'bg-gradient-to-r from-pink-400 to-rose-500'
                            )} />
                            <div className="p-5 space-y-3">
                                <div className="flex items-center gap-2">
                                    {item.type === 'story'
                                        ? <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                                        : <Feather className="h-3.5 w-3.5 text-pink-500" />}
                                    <span className={cn('text-[10px] font-bold uppercase tracking-wide',
                                        item.type === 'story' ? 'text-indigo-500' : 'text-pink-500')}>
                                        {item.type}
                                    </span>
                                    {item.genre && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize">{item.genre}</span>}
                                </div>
                                <h3 className="font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-emerald-700 transition-colors">
                                    {item.title}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="font-medium">by {item.author}</span>
                                    <span>·</span>
                                    <Calendar className="h-3 w-3" />
                                    <span>{new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{item.excerpt || 'No preview available.'}</p>
                                <div className="flex items-center justify-between pt-1">
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{item.views.toLocaleString()}</span>
                                        <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5 text-rose-400" />{item.likes}</span>
                                        <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />{item.rating}</span>
                                    </div>
                                    {/* Read hint */}
                                    <span className="text-[10px] font-semibold text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                        <BookOpen className="h-3 w-3" /> Read
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!isLoading && (
                <div className="flex items-center justify-between px-1">
                    <p className="text-xs text-muted-foreground">
                        Showing {Math.min((safePage - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
                    </p>
                    <div className="flex items-center gap-1.5">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                            className="p-1.5 rounded-lg border hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">‹</button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                            <button key={pg} onClick={() => setPage(pg)}
                                className={cn('w-8 h-8 text-xs font-semibold rounded-lg transition-colors',
                                    pg === safePage ? 'bg-emerald-600 text-white' : 'border text-gray-500 hover:bg-gray-100')}>
                                {pg}
                            </button>
                        ))}
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                            className="p-1.5 rounded-lg border hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">›</button>
                    </div>
                </div>
            )}

            {/* Book Reader modal */}
            <AnimatePresence>
                {reading && <BookReader item={reading} onClose={() => setReading(null)} />}
            </AnimatePresence>
        </div>
    );
}
