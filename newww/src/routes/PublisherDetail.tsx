import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2, Mail, Phone, MapPin, Hash,
    BookOpen, BookMarked, ShoppingCart, Layers,
    UserPlus, Loader2, ChevronLeft, AlertCircle,
    CheckCircle, Clock, X, TrendingUp, Star,
} from 'lucide-react';
import {
    fetchPublisherProfile,
    fetchPublisherStats,
    fetchPublisherBooks,
    fetchPublisherCategories,
    requestJoinPublisherByPid,
} from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Pagination } from '../components/Pagination';
import { useToast } from '../hooks/useToast';
import { cn } from '../lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────
const BOOKS_PER_PAGE = 12;
const FIXED_CATEGORIES = ['all', 'fiction', 'non-fiction', 'ghost', 'horror', 'mystery', 'romance', 'sci-fi'];

// Deterministic dummy cover from picsum using a seed string
const getDummyCover = (seed: string) =>
    `https://picsum.photos/seed/${encodeURIComponent(seed)}/200/280`;

// ─── Types ────────────────────────────────────────────────────────────────────
interface PublisherProfile {
    pid: string;
    name: string;
    description?: string;
    email?: string;
    phone?: string;
    logo_url?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zip_code?: string;
    status?: string;
    rgst_gov_id?: string;
    createdAt?: string;
}

interface PublisherStats {
    total_books: number;
    total_ebooks: number;
    total_sales: number;
    books_sold: number;
    ebooks_sold: number;
    active_categories: number;
}

interface PublisherBook {
    _id: string;
    cont_id?: string;
    name?: string;
    type?: string;
    category?: string;
    url?: string;
    cover_image?: string;
    sales_count?: number;
    status?: string;
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
        <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border', cfg.cls)}>
            <Icon className="h-3 w-3" />
            {status ?? 'Pending'}
        </span>
    );
}

// ─── Analytics Card ───────────────────────────────────────────────────────────
interface AnalyticsCardProps {
    title: string;
    value: number;
    icon: any;
    gradient: string;
    delay?: number;
}

function AnalyticsCard({ title, value, icon: Icon, gradient, delay = 0 }: AnalyticsCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.35, ease: 'easeOut' }}
            className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg"
            style={{ background: gradient }}
        >
            {/* decorative circle */}
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
            <div className="absolute -right-2 -bottom-6 h-28 w-28 rounded-full bg-white/5" />

            <div className="relative z-10">
                <div className="mb-3 h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70 mb-1">{title}</p>
                <p className="text-3xl font-black tabular-nums">{value.toLocaleString()}</p>
            </div>
        </motion.div>
    );
}

// ─── Book Card ────────────────────────────────────────────────────────────────
function BookCard({ book, index }: { book: PublisherBook; index: number }) {
    const isEbook = book.type?.toLowerCase() === 'ebook';
    const seed = book.cont_id || book._id || `book-${index}`;
    const coverSrc = book.url || book.cover_image || getDummyCover(seed);
    const [imgSrc, setImgSrc] = useState(coverSrc);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.28, ease: 'easeOut' }}
            className="group cursor-pointer"
        >
            <div className="bg-white dark:bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                {/* Cover */}
                <div className="aspect-[3/4] relative overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex-shrink-0">
                    <img
                        src={imgSrc}
                        alt={book.name || 'Book cover'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={() => setImgSrc(getDummyCover(seed + '-fallback'))}
                        loading="lazy"
                    />
                    {/* Overlay gradient for text legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Format pill */}
                    <span className={cn(
                        'absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm',
                        isEbook ? 'bg-blue-600 text-white' : 'bg-amber-500 text-white'
                    )}>
                        {isEbook ? 'eBook' : 'Book'}
                    </span>

                    {/* Sales on hover */}
                    {book.sales_count != null && (
                        <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <ShoppingCart className="h-3 w-3" />
                            <span>{book.sales_count.toLocaleString()} sold</span>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="p-3 flex-1 flex flex-col gap-1.5">
                    <p className="text-sm font-bold leading-tight line-clamp-2 text-foreground">
                        {book.name || 'Untitled'}
                    </p>
                    {book.category && (
                        <span className="inline-block self-start text-[10px] font-semibold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full capitalize">
                            {book.category}
                        </span>
                    )}
                    {book.sales_count != null && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-auto pt-1">
                            <ShoppingCart className="h-3 w-3" />
                            <span>{book.sales_count.toLocaleString()} sold</span>
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
        <div className="space-y-6 animate-pulse">
            <div className="bg-white rounded-3xl overflow-hidden border border-border/40 shadow-sm">
                <div className="h-40 bg-gradient-to-r from-violet-200 to-purple-200" />
                <div className="px-6 pb-6">
                    <div className="flex items-end justify-between -mt-10">
                        <div className="h-20 w-20 rounded-2xl bg-slate-200 border-4 border-white" />
                        <div className="h-10 w-36 rounded-full bg-slate-200" />
                    </div>
                    <div className="mt-4 space-y-2">
                        <div className="h-7 w-48 rounded-lg bg-slate-200" />
                        <div className="h-4 w-72 rounded-lg bg-slate-100" />
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-3">
                        {[1, 2, 3].map(i => <div key={i} className="h-4 rounded bg-slate-100" />)}
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-28 rounded-2xl bg-slate-200" />
                ))}
            </div>
            <div className="flex gap-2">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-9 w-20 rounded-full bg-slate-200" />)}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="aspect-[3/4] rounded-2xl bg-slate-200" />
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

    // Fetch profile
    const { data: profile, isLoading: profileLoading, isError: profileError } =
        useQuery<PublisherProfile>({
            queryKey: ['publisher-profile', pid],
            queryFn: () => fetchPublisherProfile(pid),
            staleTime: 60_000,
            enabled: !!pid,
        });

    // Fetch stats
    const { data: stats } = useQuery<PublisherStats>({
        queryKey: ['publisher-stats', pid],
        queryFn: () => fetchPublisherStats(pid),
        staleTime: 60_000,
        enabled: !!pid,
    });

    // Fetch dynamic categories
    const { data: dynamicCategories = [] } = useQuery<string[]>({
        queryKey: ['publisher-categories', pid],
        queryFn: () => fetchPublisherCategories(pid),
        staleTime: 120_000,
        enabled: !!pid,
    });

    // Fetch books
    const { data: booksData, isLoading: booksLoading } = useQuery({
        queryKey: ['publisher-books', pid, activeCategory, booksPage],
        queryFn: () => fetchPublisherBooks(pid, booksPage, BOOKS_PER_PAGE, activeCategory),
        staleTime: 30_000,
        enabled: !!pid,
    });

    const books: PublisherBook[] = booksData?.data ?? [];
    const booksMeta = booksData?.meta ?? { total: 0, totalPages: 1, page: 1 };

    const allCategoryTabs = [
        ...FIXED_CATEGORIES,
        ...dynamicCategories
            .map(c => c.toLowerCase())
            .filter(c => !FIXED_CATEGORIES.includes(c)),
    ];

    // Join mutation
    const joinMutation = useMutation({
        mutationFn: () => requestJoinPublisherByPid(pid),
        onSuccess: () => {
            toast({ title: '🎉 Request Sent!', description: `You've requested to join ${profile?.name ?? 'this publisher'}.` });
            queryClient.invalidateQueries({ queryKey: ['publisher-profile', pid] });
        },
        onError: (err: any) => {
            if (err?.response?.status === 409) {
                toast({ title: 'Already Requested', description: 'Your join request is already pending.', variant: 'destructive' });
            } else {
                toast({ title: 'Error', description: err?.response?.data?.message ?? 'Failed to send request.', variant: 'destructive' });
            }
        },
    });

    const handleCategoryChange = (cat: string) => {
        setActiveCategory(cat);
        setBooksPage(1);
    };

    // ── Loading ───────────────────────────────────────────────────────────────
    if (profileLoading) {
        return (
            <div className="min-h-screen bg-[#f3f2ef] dark:bg-background">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                    <ProfileSkeleton />
                </div>
            </div>
        );
    }

    // ── Error ─────────────────────────────────────────────────────────────────
    if (profileError || !profile) {
        return (
            <div className="min-h-screen bg-[#f3f2ef] dark:bg-background flex items-center justify-center">
                <div className="text-center space-y-4 px-6">
                    <div className="h-20 w-20 mx-auto rounded-3xl bg-red-100 flex items-center justify-center">
                        <AlertCircle className="h-10 w-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold">Publisher Not Found</h2>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                        The publisher you're looking for doesn't exist or couldn't be loaded.
                    </p>
                    <Button onClick={() => navigate({ to: '/' })} className="gap-2 rounded-full mt-2">
                        <ChevronLeft className="h-4 w-4" /> Go Back
                    </Button>
                </div>
            </div>
        );
    }

    // ── Stats config ──────────────────────────────────────────────────────────
    const statCards: AnalyticsCardProps[] = [
        { title: 'Total Books', value: stats?.total_books ?? 0, icon: BookOpen, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', delay: 0.05 },
        { title: 'Total eBooks', value: stats?.total_ebooks ?? 0, icon: BookMarked, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', delay: 0.1 },
        { title: 'Total Sales', value: stats?.total_sales ?? 0, icon: TrendingUp, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', delay: 0.15 },
        { title: 'Books Sold', value: stats?.books_sold ?? 0, icon: ShoppingCart, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', delay: 0.2 },
        { title: 'eBooks Sold', value: stats?.ebooks_sold ?? 0, icon: Star, gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', delay: 0.25 },
        { title: 'Active Categories', value: stats?.active_categories ?? 0, icon: Layers, gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', delay: 0.3 },
    ];

    // ── Address ───────────────────────────────────────────────────────────────
    const addressParts = [profile.address, profile.city, profile.state, profile.country, profile.zip_code].filter(Boolean);
    const fullAddress = addressParts.join(', ');

    // ── Initials for logo fallback ────────────────────────────────────────────
    const initials = (profile.name ?? '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

    return (
        <div className="min-h-screen bg-[#f3f2ef] dark:bg-background pb-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-5 pt-5">

                {/* ── Back ──────────────────────────────────────────────────── */}
                <motion.button
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate({ to: '/' })}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                    <ChevronLeft className="h-4 w-4" /> Back
                </motion.button>

                {/* ── Hero Card ──────────────────────────────────────────────── */}
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <div className="bg-white dark:bg-card rounded-3xl overflow-hidden border border-border/40 shadow-sm">

                        {/* Banner */}
                        <div
                            className="h-36 sm:h-48 relative"
                            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)' }}
                        >
                            {/* Decorative blobs */}
                            <div className="absolute top-4 left-8 h-16 w-16 rounded-full bg-white/10 blur-xl" />
                            <div className="absolute bottom-4 right-12 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                            <div className="absolute top-6 right-24 h-10 w-10 rounded-full bg-white/15" />
                        </div>

                        {/* Profile row: logo + button, overlapping the banner bottom */}
                        <div className="px-5 sm:px-8">
                            <div className="flex items-end justify-between -mt-10 sm:-mt-12 mb-4">
                                {/* Logo */}
                                <div className="h-20 relative z-10 w-20 sm:h-24 sm:w-24 rounded-2xl sm:rounded-3xl border-4 border-white dark:border-card shadow-xl overflow-hidden flex-shrink-0 bg-white flex items-center justify-center">
                                    {profile.logo_url ? (
                                        <img
                                            src={profile.logo_url}
                                            alt={profile.name}
                                            className="h-full w-full object-cover"
                                            onError={e => {
                                                e.currentTarget.style.display = 'none';
                                                (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden');
                                            }}
                                        />
                                    ) : null}
                                    <span className={cn(
                                        'text-2xl font-black text-violet-600',
                                        profile.logo_url ? 'hidden' : ''
                                    )}>
                                        {initials}
                                    </span>
                                </div>

                                {/* Join Button */}
                                <Button
                                    id="join-publisher-btn"
                                    onClick={() => joinMutation.mutate()}
                                    disabled={joinMutation.isPending}
                                    className="rounded-full px-5 sm:px-7 h-10 sm:h-11 font-bold gap-2 text-sm shadow-lg hover:shadow-xl transition-all"
                                    style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                                >
                                    {joinMutation.isPending
                                        ? <><Loader2 className="h-4 w-4 animate-spin" /> <span className="text-white text-white">Sending…</span></>
                                        : <><UserPlus className="h-4 w-4 text-white" /> <span className="text-white text-white">Join Publisher</span></>
                                    }
                                </Button>
                            </div>

                            {/* Name + Status */}
                            <div className="flex flex-wrap items-center gap-2.5 mb-2">
                                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                                    {profile.name}
                                </h1>
                                <StatusBadge status={profile.status} />
                            </div>

                            {/* Description */}
                            {profile.description && (
                                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mb-4">
                                    {profile.description}
                                </p>
                            )}

                            {/* Contact row */}
                            <div className="flex flex-wrap gap-x-6 gap-y-2.5 text-sm pb-6 pt-1 border-t border-border/30 mt-3">
                                {profile.email && (
                                    <a href={`mailto:${profile.email}`}
                                        className="flex items-center gap-2 text-muted-foreground hover:text-violet-600 transition-colors">
                                        <Mail className="h-4 w-4 text-violet-500 flex-shrink-0" />
                                        {profile.email}
                                    </a>
                                )}
                                {profile.phone && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="h-4 w-4 text-violet-500 flex-shrink-0" />
                                        {profile.phone}
                                    </div>
                                )}
                                {fullAddress && (
                                    <div className="flex items-start gap-2 text-muted-foreground">
                                        <MapPin className="h-4 w-4 text-violet-500 flex-shrink-0 mt-0.5" />
                                        <span>{fullAddress}</span>
                                    </div>
                                )}
                                {profile.rgst_gov_id && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Hash className="h-4 w-4 text-violet-500 flex-shrink-0" />
                                        <span className="font-mono text-xs">Reg: {profile.rgst_gov_id}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ── Analytics ──────────────────────────────────────────────── */}
                <div>
                    <h2 className="text-base font-bold text-foreground mb-3 px-1 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-violet-500" />
                        Analytics Overview
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {statCards.map(card => (
                            <AnalyticsCard key={card.title} {...card} />
                        ))}
                    </div>
                </div>

                {/* ── Books Section ───────────────────────────────────────────── */}
                <div>
                    <h2 className="text-base font-bold text-foreground mb-3 px-1 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-violet-500" />
                        Books &amp; eBooks
                    </h2>

                    {/* Category Tabs */}
                    <div className="overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                        <div className="flex gap-2 min-w-max">
                            {allCategoryTabs.map(cat => (
                                <button
                                    key={cat}
                                    id={`tab-${cat}`}
                                    onClick={() => handleCategoryChange(cat)}
                                    className={cn(
                                        'px-4 py-2 text-sm font-semibold rounded-full transition-all capitalize whitespace-nowrap border',
                                        activeCategory === cat
                                            ? 'text-white border-transparent shadow-md'
                                            : 'bg-white dark:bg-card text-muted-foreground hover:text-foreground border-border hover:border-violet-300 hover:shadow-sm'
                                    )}
                                    style={activeCategory === cat
                                        ? { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
                                        : {}
                                    }
                                >
                                    {cat === 'all' ? 'All' : cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Books Grid */}
                    <div className="mt-4">
                        <AnimatePresence mode="wait">
                            {booksLoading ? (
                                <motion.div
                                    key="books-loading"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                                >
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <div key={i} className="aspect-[3/4] rounded-2xl bg-slate-200 animate-pulse" />
                                    ))}
                                </motion.div>
                            ) : books.length === 0 ? (
                                <motion.div
                                    key="books-empty"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="bg-white dark:bg-card border border-border/40 rounded-3xl py-20 flex flex-col items-center gap-3 text-center"
                                >
                                    <div className="h-16 w-16 rounded-3xl bg-violet-100 flex items-center justify-center">
                                        <BookOpen className="h-8 w-8 text-violet-400" />
                                    </div>
                                    <p className="text-base font-semibold text-foreground">
                                        {activeCategory === 'all' ? 'No books published yet' : `No ${activeCategory} books found`}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Check back later for new releases.</p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={`books-${activeCategory}-${booksPage}`}
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
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
                            <div className="mt-6">
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
