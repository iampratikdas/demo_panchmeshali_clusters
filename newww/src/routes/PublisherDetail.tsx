import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, BookMarked, ShoppingCart, Layers,
    UserPlus, Loader2, ChevronLeft, AlertCircle,
    CheckCircle, Clock, X, TrendingUp, Star,
    Mail, Phone, MapPin, Hash,
} from 'lucide-react';
import {
    fetchPublisherProfile,
    fetchPublisherStats,
    fetchPublisherBooks,
    fetchPublisherCategories,
    requestJoinPublisherByPid,
} from '../lib/api';
import { Button } from '../ui/button';
import { Pagination } from '../components/Pagination';
import { useToast } from '../hooks/useToast';
import { cn } from '../lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────
const BOOKS_PER_PAGE = 12;
const FIXED_CATEGORIES = ['all', 'fiction', 'non-fiction', 'ghost', 'horror', 'mystery', 'romance', 'sci-fi'];
const getDummyCover = (seed: string) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/200/280`;

// ─── Types ────────────────────────────────────────────────────────────────────
interface PublisherProfile {
    pid: string; name: string; description?: string; email?: string; phone?: string;
    logo_url?: string; address?: string; city?: string; state?: string;
    country?: string; zip_code?: string; status?: string; rgst_gov_id?: string; createdAt?: string;
}
interface PublisherStats {
    total_books: number; total_ebooks: number; total_sales: number;
    books_sold: number; ebooks_sold: number; active_categories: number;
}
interface PublisherBook {
    _id: string; cont_id?: string; name?: string; type?: string;
    category?: string; url?: string; cover_image?: string; sales_count?: number; status?: string;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status?: string }) {
    const map: Record<string, { cls: string; icon: any }> = {
        Active: { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
        Pending: { cls: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
        Inactive: { cls: 'bg-slate-100 text-slate-500 border-slate-200', icon: X },
    };
    const cfg = map[status ?? ''] ?? map['Pending'];
    const Icon = cfg.icon;
    return (
        <span className={cn('inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border', cfg.cls)}>
            <Icon className="h-3 w-3 flex-shrink-0" />
            {status ?? 'Pending'}
        </span>
    );
}

// ─── Analytics Card ───────────────────────────────────────────────────────────
function AnalyticsCard({ title, value, icon: Icon, gradient, delay = 0 }:
    { title: string; value: number; icon: any; gradient: string; delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.35, ease: 'easeOut' }}
            className="relative overflow-hidden rounded-2xl p-4 text-white shadow-md"
            style={{ background: gradient }}
        >
            <div className="absolute -right-3 -top-3 h-16 w-16 rounded-full bg-white/10" />
            <div className="absolute -right-1 -bottom-5 h-20 w-20 rounded-full bg-white/5" />
            <div className="relative z-10">
                <div className="mb-2 h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-white" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-0.5 leading-tight">{title}</p>
                <p className="text-2xl font-black tabular-nums leading-none">{value.toLocaleString()}</p>
            </div>
        </motion.div>
    );
}

// ─── Book Card ────────────────────────────────────────────────────────────────
function BookCard({ book, index }: { book: PublisherBook; index: number }) {
    const isEbook = book.type?.toLowerCase() === 'ebook';
    const seed = book.cont_id || book._id || `book-${index}`;
    const [imgSrc, setImgSrc] = useState(book.url || book.cover_image || getDummyCover(seed));

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.28, ease: 'easeOut' }}
            className="group cursor-pointer"
        >
            <div className="bg-white dark:bg-card rounded-xl overflow-hidden border border-border/40 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col">
                {/* Cover */}
                <div className="aspect-[3/4] relative overflow-hidden bg-slate-100 flex-shrink-0">
                    <img
                        src={imgSrc}
                        alt={book.name || 'Book cover'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={() => setImgSrc(getDummyCover(seed + '-fb'))}
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {/* Format badge */}
                    <span className={cn(
                        'absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow',
                        isEbook ? 'bg-blue-600 text-white' : 'bg-amber-500 text-white'
                    )}>
                        {isEbook ? 'eBook' : 'Book'}
                    </span>
                    {/* Sales overlay on hover (hidden on mobile via opacity, shown on desktop hover) */}
                    {book.sales_count != null && (
                        <div className="absolute bottom-1.5 left-1.5 right-1.5 hidden sm:flex items-center gap-1 text-white text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <ShoppingCart className="h-2.5 w-2.5" />
                            <span>{book.sales_count.toLocaleString()} sold</span>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="p-2.5 flex-1 flex flex-col gap-1">
                    <p className="text-xs font-bold leading-tight line-clamp-2 text-foreground">
                        {book.name || 'Untitled'}
                    </p>
                    {book.category && (
                        <span className="inline-block self-start text-[9px] font-semibold bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full capitalize">
                            {book.category}
                        </span>
                    )}
                    {/* Sales always visible on mobile */}
                    {book.sales_count != null && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-auto pt-1">
                            <ShoppingCart className="h-2.5 w-2.5 flex-shrink-0" />
                            <span>{book.sales_count.toLocaleString()}</span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function ProfileSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="bg-white rounded-2xl overflow-hidden border border-border/40">
                <div className="h-28 sm:h-40 bg-gradient-to-r from-violet-200 to-purple-200" />
                <div className="px-4 pb-5">
                    <div className="flex items-end justify-between -mt-8">
                        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-slate-200 border-4 border-white" />
                        <div className="h-9 w-28 rounded-full bg-slate-200" />
                    </div>
                    <div className="mt-3 space-y-2">
                        <div className="h-6 w-40 rounded-lg bg-slate-200" />
                        <div className="h-3 w-64 rounded bg-slate-100" />
                        <div className="h-3 w-48 rounded bg-slate-100" />
                    </div>
                    <div className="mt-4 space-y-2">
                        {[1, 2, 3].map(i => <div key={i} className="h-3 rounded bg-slate-100" />)}
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-24 rounded-2xl bg-slate-200" />
                ))}
            </div>
            <div className="flex gap-2 overflow-hidden">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-8 w-16 rounded-full bg-slate-200 flex-shrink-0" />)}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="aspect-[3/4] rounded-xl bg-slate-200" />
                ))}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PublisherDetail() {
    const { pid } = useParams({ from: '/publishers/$pid' });
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [activeCategory, setActiveCategory] = useState('all');
    const [booksPage, setBooksPage] = useState(1);

    const { data: profile, isLoading: profileLoading, isError: profileError } =
        useQuery<PublisherProfile>({
            queryKey: ['publisher-profile', pid],
            queryFn: () => fetchPublisherProfile(pid),
            staleTime: 60_000, enabled: !!pid,
        });

    const { data: stats } = useQuery<PublisherStats>({
        queryKey: ['publisher-stats', pid],
        queryFn: () => fetchPublisherStats(pid),
        staleTime: 60_000, enabled: !!pid,
    });

    const { data: dynamicCategories = [] } = useQuery<string[]>({
        queryKey: ['publisher-categories', pid],
        queryFn: () => fetchPublisherCategories(pid),
        staleTime: 120_000, enabled: !!pid,
    });

    const { data: booksData, isLoading: booksLoading } = useQuery({
        queryKey: ['publisher-books', pid, activeCategory, booksPage],
        queryFn: () => fetchPublisherBooks(pid, booksPage, BOOKS_PER_PAGE, activeCategory),
        staleTime: 30_000, enabled: !!pid,
    });

    const books: PublisherBook[] = booksData?.data ?? [];
    const booksMeta = booksData?.meta ?? { total: 0, totalPages: 1, page: 1 };

    const allCategoryTabs = [
        ...FIXED_CATEGORIES,
        ...dynamicCategories.map(c => c.toLowerCase()).filter(c => !FIXED_CATEGORIES.includes(c)),
    ];

    const joinMutation = useMutation({
        mutationFn: () => requestJoinPublisherByPid(pid),
        onSuccess: () => {
            toast({ title: '🎉 Request Sent!', description: `You've requested to join ${profile?.name ?? 'this publisher'}.` });
            queryClient.invalidateQueries({ queryKey: ['publisher-profile', pid] });
        },
        onError: (err: any) => {
            if (err?.response?.status === 409) {
                toast({ title: 'Already Requested', description: 'Your join request is pending.', variant: 'destructive' });
            } else {
                toast({ title: 'Error', description: err?.response?.data?.message ?? 'Failed to send request.', variant: 'destructive' });
            }
        },
    });

    const handleCategoryChange = (cat: string) => { setActiveCategory(cat); setBooksPage(1); };

    // ── Loading ───────────────────────────────────────────────────────────────
    if (profileLoading) {
        return (
            <div className="min-h-screen bg-[#f3f2ef] dark:bg-background">
                <div className="max-w-3xl mx-auto px-3 sm:px-5 py-4">
                    <ProfileSkeleton />
                </div>
            </div>
        );
    }

    // ── Error ─────────────────────────────────────────────────────────────────
    if (profileError || !profile) {
        return (
            <div className="min-h-screen bg-[#f3f2ef] dark:bg-background flex items-center justify-center px-4">
                <div className="text-center space-y-4 max-w-xs w-full">
                    <div className="h-16 w-16 mx-auto rounded-3xl bg-red-100 flex items-center justify-center">
                        <AlertCircle className="h-8 w-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold">Publisher Not Found</h2>
                    <p className="text-muted-foreground text-sm">
                        The publisher you're looking for doesn't exist or couldn't be loaded.
                    </p>
                    <Button onClick={() => navigate({ to: '/' })} className="gap-2 rounded-full w-full">
                        <ChevronLeft className="h-4 w-4" /> Go Back
                    </Button>
                </div>
            </div>
        );
    }

    // Stats config
    const statCards = [
        { title: 'Total Books', value: stats?.total_books ?? 0, icon: BookOpen, gradient: 'linear-gradient(135deg,#667eea,#764ba2)', delay: 0.05 },
        { title: 'Total eBooks', value: stats?.total_ebooks ?? 0, icon: BookMarked, gradient: 'linear-gradient(135deg,#f093fb,#f5576c)', delay: 0.1 },
        { title: 'Total Sales', value: stats?.total_sales ?? 0, icon: TrendingUp, gradient: 'linear-gradient(135deg,#4facfe,#00f2fe)', delay: 0.15 },
        { title: 'Books Sold', value: stats?.books_sold ?? 0, icon: ShoppingCart, gradient: 'linear-gradient(135deg,#43e97b,#38f9d7)', delay: 0.2 },
        { title: 'eBooks Sold', value: stats?.ebooks_sold ?? 0, icon: Star, gradient: 'linear-gradient(135deg,#fa709a,#fee140)', delay: 0.25 },
        { title: 'Active Categories', value: stats?.active_categories ?? 0, icon: Layers, gradient: 'linear-gradient(135deg,#a18cd1,#fbc2eb)', delay: 0.3 },
    ];

    const addressParts = [profile.address, profile.city, profile.state, profile.country, profile.zip_code].filter(Boolean);
    const fullAddress = addressParts.join(', ');
    const initials = (profile.name ?? '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

    return (
        <div className="min-h-screen bg-[#f3f2ef] dark:bg-background pb-16">
            <div className="max-w-7xl mx-auto px-3 sm:px-5 space-y-4 pt-4">

                {/* ── Back ────────────────────────────────────────────────── */}
                <motion.button
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate({ to: '/' })}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                    <ChevronLeft className="h-4 w-4" /> Back
                </motion.button>

                {/* ── Hero Card ────────────────────────────────────────────── */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <div className="bg-white dark:bg-card rounded-2xl overflow-hidden border border-border/40 shadow-sm">

                        {/* Banner — shorter on mobile */}
                        <div
                            className="h-28 sm:h-40 relative"
                            style={{ background: 'linear-gradient(135deg,#667eea 0%,#764ba2 50%,#f093fb 100%)' }}
                        >
                            <div className="absolute top-3 left-6 h-12 w-12 rounded-full bg-white/10 blur-xl" />
                            <div className="absolute bottom-3 right-8 h-16 w-16 rounded-full bg-white/10 blur-2xl" />
                            <div className="absolute top-4 right-16 h-8 w-8 rounded-full bg-white/15" />
                        </div>

                        {/* Logo + Join row */}
                        <div className="px-4 sm:px-6">
                            <div className="flex items-end justify-between -mt-8 sm:-mt-10 mb-3">
                                {/* Logo */}
                                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border-[3px] border-white dark:border-card shadow-lg overflow-hidden flex-shrink-0 bg-white flex items-center justify-center relative z-10">
                                    {profile.logo_url ? (
                                        <img
                                            src={profile.logo_url}
                                            alt={profile.name}
                                            className="h-full w-full object-cover"
                                            onError={e => { e.currentTarget.style.display = 'none'; (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden'); }}
                                        />
                                    ) : null}
                                    <span className={cn('text-xl sm:text-2xl font-black text-violet-600', profile.logo_url ? 'hidden' : '')}>
                                        {initials}
                                    </span>
                                </div>

                                {/* Join Button — compact on mobile */}
                                <Button
                                    id="join-publisher-btn"
                                    onClick={() => joinMutation.mutate()}
                                    disabled={joinMutation.isPending}
                                    className="rounded-full mb-6 h-9 px-4 sm:h-10 sm:px-6 font-bold gap-1.5 text-xs sm:text-sm shadow-md hover:shadow-lg transition-all text-white"
                                    style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}
                                >
                                    {joinMutation.isPending
                                        ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /><span>Sending…</span></>
                                        : <><UserPlus className="h-3.5 w-3.5" /><span>Join</span></>
                                    }
                                </Button>
                            </div>

                            {/* Name + Status — wraps gracefully on mobile */}
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground leading-tight">
                                    {profile.name}
                                </h1>
                                <StatusBadge status={profile.status} />
                            </div>

                            {/* Description */}
                            {profile.description && (
                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-3 sm:line-clamp-none">
                                    {profile.description}
                                </p>
                            )}

                            {/* Contact grid — stacks on mobile, 2-col on sm+ */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-xs sm:text-sm pb-4 pt-3 border-t border-border/30 mt-2">
                                {profile.email && (
                                    <a href={`mailto:${profile.email}`}
                                        className="flex items-center gap-2 text-muted-foreground hover:text-violet-600 transition-colors min-w-0">
                                        <Mail className="h-3.5 w-3.5 text-violet-500 flex-shrink-0" />
                                        <span className="truncate">{profile.email}</span>
                                    </a>
                                )}
                                {profile.phone && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="h-3.5 w-3.5 text-violet-500 flex-shrink-0" />
                                        <span>{profile.phone}</span>
                                    </div>
                                )}
                                {fullAddress && (
                                    <div className="flex items-start gap-2 text-muted-foreground sm:col-span-2">
                                        <MapPin className="h-3.5 w-3.5 text-violet-500 flex-shrink-0 mt-0.5" />
                                        <span className="leading-snug">{fullAddress}</span>
                                    </div>
                                )}
                                {profile.rgst_gov_id && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Hash className="h-3.5 w-3.5 text-violet-500 flex-shrink-0" />
                                        <span className="font-mono text-[11px]">Reg: {profile.rgst_gov_id}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ── Analytics ─────────────────────────────────────────────── */}
                <div>
                    <h2 className="text-sm font-bold text-foreground mb-2.5 px-0.5 flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4 text-violet-500" />
                        Analytics Overview
                    </h2>
                    {/* 2 cols on all phones, 3 on sm+ */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                        {statCards.map(card => (
                            <AnalyticsCard key={card.title} {...card} />
                        ))}
                    </div>
                </div>

                {/* ── Books Section ──────────────────────────────────────────── */}
                <div>
                    <h2 className="text-sm font-bold text-foreground mb-2.5 px-0.5 flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-violet-500" />
                        Books &amp; eBooks
                    </h2>

                    {/* Category tabs — always horizontally scrollable, no wrapping */}
                    <div className="overflow-x-auto -mx-3 sm:-mx-5 px-3 sm:px-5 pb-1"
                        style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
                        <div className="flex gap-2 min-w-max">
                            {allCategoryTabs.map(cat => (
                                <button
                                    key={cat}
                                    id={`tab-${cat}`}
                                    onClick={() => handleCategoryChange(cat)}
                                    className={cn(
                                        'h-8 px-3 text-xs font-semibold rounded-full transition-all capitalize whitespace-nowrap border flex-shrink-0',
                                        activeCategory === cat
                                            ? 'text-white border-transparent shadow-sm'
                                            : 'bg-white dark:bg-card text-muted-foreground hover:text-foreground border-border'
                                    )}
                                    style={activeCategory === cat
                                        ? { background: 'linear-gradient(135deg,#667eea,#764ba2)' }
                                        : {}
                                    }
                                >
                                    {cat === 'all' ? 'All' : cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Books Grid — 2 cols mobile, 3 sm, 4 md+ */}
                    <div className="mt-3">
                        <AnimatePresence mode="wait">
                            {booksLoading ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
                                >
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div key={i} className="aspect-[3/4] rounded-xl bg-slate-200 animate-pulse" />
                                    ))}
                                </motion.div>
                            ) : books.length === 0 ? (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="bg-white dark:bg-card border border-border/40 rounded-2xl py-14 px-6 flex flex-col items-center gap-3 text-center"
                                >
                                    <div className="h-14 w-14 rounded-2xl bg-violet-100 flex items-center justify-center">
                                        <BookOpen className="h-7 w-7 text-violet-400" />
                                    </div>
                                    <p className="text-sm font-semibold text-foreground">
                                        {activeCategory === 'all' ? 'No books published yet' : `No ${activeCategory} books found`}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Check back later for new releases.</p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={`books-${activeCategory}-${booksPage}`}
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
                                >
                                    {books.map((book, idx) => (
                                        <BookCard
                                            key={book._id || book.cont_id || String(idx)}
                                            book={book}
                                            index={idx}
                                        />
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {booksMeta.totalPages > 1 && (
                            <div className="mt-5">
                                <Pagination
                                    currentPage={booksPage}
                                    totalPages={booksMeta.totalPages}
                                    onPageChange={page => {
                                        setBooksPage(page);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
