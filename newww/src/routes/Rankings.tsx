import { useState, useMemo } from 'react';
import { useAtom } from 'jotai';
import { useQuery } from '@tanstack/react-query';
import { fetchContents, fetchEvents } from '../lib/api';
import { currentUserAtom } from '../store/atoms';
import { generateCertificate } from '../lib/certificate';
import {
    Trophy, Star, TrendingUp, Award, Crown,
    ChevronLeft, ChevronRight, CalendarDays, ChevronDown,
    Download, Loader2, Medal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

const RANK_COLORS = [
    'from-yellow-400 to-amber-500',
    'from-gray-300 to-gray-400',
    'from-orange-400 to-orange-600',
];
const RANK_ICONS = [Crown, Trophy, Award];

interface RankedContent {
    id: string;
    title: string;
    type: string;
    author: string;
    authorId: string;
    score: number;
    votes: number;
    rank: number;
}

// Stable scores per content id
const scoreCache = new Map<string, number>();
const voteCache = new Map<string, number>();
function stableScore(id: string) {
    if (!scoreCache.has(id)) scoreCache.set(id, Math.floor(Math.random() * 40) + 60);
    return scoreCache.get(id)!;
}
function stableVotes(id: string) {
    if (!voteCache.has(id)) voteCache.set(id, Math.floor(Math.random() * 200) + 10);
    return voteCache.get(id)!;
}

const PAGE_SIZE = 5;

export default function Rankings() {
    const [currentUser] = useAtom(currentUserAtom);

    const { data: contentsData, isLoading: contentsLoading } = useQuery({
        queryKey: ['contents', 1, 50],
        queryFn: () => fetchContents(1, 50),
    });
    const { data: eventsData, isLoading: eventsLoading } = useQuery({
        queryKey: ['events'],
        queryFn: fetchEvents,
    });

    const [sortBy, setSortBy] = useState<'score' | 'votes'>('score');
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [eventOpen, setEventOpen] = useState(false);
    const [page, setPage] = useState(1);
    // Track which row is currently generating a certificate
    const [generatingId, setGeneratingId] = useState<string | null>(null);

    /* ── Build ranked list ── */
    const allRanked: RankedContent[] = useMemo(() => {
        return (contentsData?.data ?? [])
            .map(c => ({
                id: c.id,
                title: c.title,
                type: c.type ?? 'story',
                author: c.authorName ?? 'Unknown',
                authorId: c.authorId ?? '',
                score: stableScore(c.id),
                votes: stableVotes(c.id),
                rank: 0,
            }))
            .sort((a, b) => sortBy === 'score' ? b.score - a.score : b.votes - a.votes)
            .map((c, i) => ({ ...c, rank: i + 1 }));
    }, [contentsData, sortBy]);

    const ranked = selectedEventId ? allRanked : [];
    const selectedEvent = eventsData?.find(e => e.eid === selectedEventId);

    /* ── Pagination ── */
    const totalPages = Math.max(1, Math.ceil(ranked.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pageItems = ranked.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
    const top3 = ranked.slice(0, 3);

    const handleEventSelect = (eid: string) => { setSelectedEventId(eid); setEventOpen(false); setPage(1); };
    const handleSort = (v: 'score' | 'votes') => { setSortBy(v); setPage(1); };

    /* ── Certificate download ── */
    const handleDownload = async (item: RankedContent) => {
        if (!selectedEvent) return;
        setGeneratingId(item.id);
        try {
            await generateCertificate({
                writerName: item.author,
                competitionName: selectedEvent.name,
                editorName: selectedEvent.team,
                participantName: item.author,
                logoUrl: selectedEvent.logo,
                position: item.rank,
            });
        } finally {
            setGeneratingId(null);
        }
    };

    /* ── Permission: can this user download a given row's cert? ── */
    const canDownload = (item: RankedContent) =>
        currentUser.isAdmin || item.authorId === currentUser.id;

    return (
        <div className="space-y-6">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="p-2.5 sm:p-3 bg-amber-100 rounded-xl shrink-0">
                        <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Rank the Contents</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Leaderboard ranked by score and community votes.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Admin badge */}
                    {currentUser.isAdmin && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 uppercase tracking-wide">
                            Admin — all certificates visible
                        </span>
                    )}
                    {/* Sort toggle */}
                    <div className="flex items-center gap-1 bg-white border rounded-xl p-1">
                        <button onClick={() => handleSort('score')}
                            className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                                sortBy === 'score' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'
                            )}
                        >
                            <Star className="h-3.5 w-3.5 inline mr-1" />Score
                        </button>
                        <button onClick={() => handleSort('votes')}
                            className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                                sortBy === 'votes' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'
                            )}
                        >
                            <TrendingUp className="h-3.5 w-3.5 inline mr-1" />Votes
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Event Dropdown ── */}
            <div className="relative max-w-md">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                    Select Event to View Rankings
                </p>
                <button
                    onClick={() => setEventOpen(o => !o)}
                    disabled={eventsLoading}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white border-2 border-amber-200 rounded-xl text-sm font-medium hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all shadow-sm"
                >
                    <div className="flex items-center gap-2.5 min-w-0">
                        <CalendarDays className="h-4 w-4 text-amber-500 shrink-0" />
                        <span className={cn('truncate', !selectedEvent && 'text-muted-foreground')}>
                            {eventsLoading ? 'Loading events…' : selectedEvent ? selectedEvent.name : 'Choose an event…'}
                        </span>
                    </div>
                    <ChevronDown className={cn('h-4 w-4 text-gray-400 shrink-0 transition-transform', eventOpen && 'rotate-180')} />
                </button>

                <AnimatePresence>
                    {eventOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
                            animate={{ opacity: 1, y: 0, scaleY: 1 }}
                            exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute z-50 mt-1 w-full bg-white border rounded-xl shadow-xl overflow-hidden origin-top"
                        >
                            {!eventsData?.length && (
                                <p className="p-4 text-sm text-muted-foreground text-center">No events found</p>
                            )}
                            {eventsData?.map(ev => (
                                <button key={ev.eid} onClick={() => handleEventSelect(ev.eid)}
                                    className={cn('w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-amber-50 transition-colors border-b last:border-0',
                                        selectedEventId === ev.eid && 'bg-amber-50 border-l-2 border-amber-500')}
                                >
                                    <CalendarDays className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">{ev.name}</p>
                                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{ev.description}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                                                ev.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                            )}>
                                                {ev.active ? 'Active' : 'Closed'}
                                            </span>
                                            {ev.type && (
                                                <span className="text-[10px] capitalize px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-semibold">{ev.type}</span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Empty state ── */}
            {!selectedEventId && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed rounded-2xl"
                >
                    <Trophy className="h-14 w-14 mb-4 opacity-20" />
                    <p className="text-base font-semibold">Select an event to view rankings</p>
                    <p className="text-sm mt-1">Rankings and certificates are displayed per event</p>
                </motion.div>
            )}

            {/* ── Leaderboard ── */}
            {selectedEventId && (
                <>
                    {/* Podium */}
                    {!contentsLoading && top3.length >= 3 && (
                        <div className="grid grid-cols-3 gap-2 sm:gap-4">
                            {[top3[1], top3[0], top3[2]].map((item, podiumIdx) => {
                                const actualRank = podiumIdx === 0 ? 2 : podiumIdx === 1 ? 1 : 3;
                                const colorGradient = RANK_COLORS[actualRank - 1];
                                const Icon = RANK_ICONS[actualRank - 1];
                                const height = actualRank === 1 ? 'h-28 sm:h-32' : actualRank === 2 ? 'h-20 sm:h-24' : 'h-16 sm:h-20';
                                return (
                                    <motion.div key={item.id}
                                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: podiumIdx * 0.1 }}
                                        className="flex flex-col items-center gap-1"
                                    >
                                        <div className="text-center px-1 w-full">
                                            <p className="text-[10px] sm:text-xs font-bold truncate">{item.title}</p>
                                            <p className="text-[9px] text-muted-foreground truncate">{item.author}</p>
                                        </div>
                                        <div className={cn('w-full rounded-t-xl flex flex-col items-center justify-end pb-2 sm:pb-3 gap-1',
                                            `bg-gradient-to-b ${colorGradient}`, height)}>
                                            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                            <span className="text-white font-black text-base sm:text-lg leading-none">#{actualRank}</span>
                                            <span className="text-white/90 text-[9px] sm:text-[10px] font-semibold">
                                                {sortBy === 'score' ? `${item.score}pts` : `${item.votes}v`}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}

                    {/* Table */}
                    <div className="glass-card rounded-2xl overflow-hidden">
                        {/* Header — 13 cols: rank(1) title(4) type(2) author(2) score(2) cert(2) */}
                        <div className="grid grid-cols-13 gap-2 px-3 sm:px-4 py-2.5 bg-gray-50 border-b text-xs font-bold text-gray-400 uppercase tracking-widest"
                            style={{ gridTemplateColumns: '2fr 5fr 2fr 3fr 3fr 3fr' }}
                        >
                            <div>Rank</div>
                            <div>Title</div>
                            <div className="hidden sm:block">Type</div>
                            <div className="hidden sm:block">Author</div>
                            <div className="text-right">{sortBy === 'score' ? 'Score' : 'Votes'}</div>
                            <div className="text-center flex items-center justify-center gap-1">
                                <Medal className="h-3 w-3" /> Certificate
                            </div>
                        </div>

                        {contentsLoading && (
                            <div className="flex items-center justify-center h-40 text-muted-foreground">
                                <Trophy className="h-8 w-8 animate-bounce opacity-30" />
                            </div>
                        )}

                        {!contentsLoading && pageItems.map((item, index) => {
                            const isTop3 = item.rank <= 3;
                            const RankIcon = isTop3 ? RANK_ICONS[item.rank - 1] : null;
                            const canDl = canDownload(item);
                            const isGenThis = generatingId === item.id;

                            return (
                                <motion.div key={item.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className={cn('px-3 sm:px-4 py-3 items-center border-b last:border-0 hover:bg-amber-50/40 transition-colors',
                                        isTop3 && 'bg-amber-50/60'
                                    )}
                                    style={{ display: 'grid', gridTemplateColumns: '2fr 5fr 2fr 3fr 3fr 3fr', gap: '8px', alignItems: 'center' }}
                                >
                                    {/* Rank */}
                                    <div className="flex items-center">
                                        {RankIcon ? (
                                            <div className={cn('p-0.5 sm:p-1 rounded-lg',
                                                item.rank === 1 ? 'text-yellow-500' : item.rank === 2 ? 'text-gray-400' : 'text-orange-500'
                                            )}>
                                                <RankIcon className="h-4 w-4" />
                                            </div>
                                        ) : (
                                            <span className="text-sm font-bold text-gray-400 w-6 text-center">{item.rank}</span>
                                        )}
                                    </div>

                                    {/* Title + mobile meta */}
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold truncate">{item.title}</p>
                                        <p className="text-[10px] text-muted-foreground truncate sm:hidden capitalize mt-0.5">
                                            {item.type} · {item.author}
                                        </p>
                                    </div>

                                    {/* Type — desktop */}
                                    <div className="hidden sm:block">
                                        <span className="text-xs capitalize px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                                            {item.type}
                                        </span>
                                    </div>

                                    {/* Author — desktop */}
                                    <div className="hidden sm:block">
                                        <p className="text-xs text-muted-foreground truncate">{item.author}</p>
                                    </div>

                                    {/* Score / Votes */}
                                    <div className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            {sortBy === 'score' ? (
                                                <>
                                                    <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
                                                    <span className="text-sm font-bold text-amber-600">{item.score}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <TrendingUp className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                                                    <span className="text-sm font-bold text-indigo-600">{item.votes}</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="mt-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                                                style={{ width: `${sortBy === 'score' ? item.score : Math.min(item.votes, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* ── Certificate column ── */}
                                    <div className="flex justify-center">
                                        {canDl ? (
                                            <button
                                                onClick={() => handleDownload(item)}
                                                disabled={isGenThis}
                                                title={`Download certificate for ${item.author}`}
                                                className={cn(
                                                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                                                    isTop3
                                                        ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                                                        : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700',
                                                    isGenThis && 'opacity-60 cursor-wait'
                                                )}
                                            >
                                                {isGenThis ? (
                                                    <><Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        <span className="hidden sm:inline">Generating…</span></>
                                                ) : (
                                                    <><Download className="h-3.5 w-3.5" />
                                                        <span className="hidden sm:inline">Download</span></>
                                                )}
                                            </button>
                                        ) : (
                                            <span className="text-[11px] text-muted-foreground italic">—</span>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}

                        {!contentsLoading && ranked.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                                <Trophy className="h-12 w-12 mb-3 opacity-20" />
                                <p className="text-sm">No content to rank for this event</p>
                            </div>
                        )}
                    </div>

                    {/* ── Legend ── */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground px-1">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-amber-500" />
                            <span>Top 3 — Gold button</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-indigo-200" />
                            <span>Participant</span>
                        </div>
                        {!currentUser.isAdmin && (
                            <div className="flex items-center gap-1.5">
                                <span className="italic">— = not your submission</span>
                            </div>
                        )}
                    </div>

                    {/* ── Pagination ── */}
                    <div className="flex items-center justify-between px-1">
                        <p className="text-xs text-muted-foreground">
                            Showing {Math.min((safePage - 1) * PAGE_SIZE + 1, ranked.length)}–{Math.min(safePage * PAGE_SIZE, ranked.length)} of {ranked.length}
                        </p>
                        <div className="flex items-center gap-1.5">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                                className="p-1.5 rounded-lg border hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                                <button key={pg} onClick={() => setPage(pg)}
                                    className={cn('w-8 h-8 text-xs font-semibold rounded-lg transition-colors',
                                        pg === safePage ? 'bg-amber-500 text-white' : 'border text-gray-500 hover:bg-gray-100'
                                    )}
                                >
                                    {pg}
                                </button>
                            ))}
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                                className="p-1.5 rounded-lg border hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
