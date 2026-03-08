import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchContents } from '../lib/api';
import { Trophy, Star, TrendingUp, Award, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const RANK_COLORS = [
    'from-yellow-400 to-amber-500',   // #1
    'from-gray-300 to-gray-400',       // #2
    'from-orange-400 to-orange-600',   // #3
];

const RANK_ICONS = [Crown, Trophy, Award];

interface RankedContent {
    id: string;
    title: string;
    type: string;
    author: string;
    score: number;
    votes: number;
    rank: number;
}

function generateScore() { return Math.floor(Math.random() * 40) + 60; }
function generateVotes() { return Math.floor(Math.random() * 200) + 10; }

export default function Rankings() {
    const { data: contentsData, isLoading } = useQuery({
        queryKey: ['contents', 1, 20],
        queryFn: () => fetchContents(1, 20),
    });

    const [sortBy, setSortBy] = useState<'score' | 'votes'>('score');

    const ranked: RankedContent[] = (contentsData?.data ?? [])
        .map((c) => ({
            id: c.id,
            title: c.title,
            type: c.type ?? 'story',
            author: c.authorId ?? 'Unknown',
            score: generateScore(),
            votes: generateVotes(),
            rank: 0,
        }))
        .sort((a, b) => sortBy === 'score' ? b.score - a.score : b.votes - a.votes)
        .map((c, i) => ({ ...c, rank: i + 1 }));

    return (
        <div className="space-y-6">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="p-3 bg-amber-100 rounded-xl shrink-0">
                        <Trophy className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Rank the Contents</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Leaderboard ranked by score and community votes.
                        </p>
                    </div>
                </div>

                {/* Sort toggle */}
                <div className="flex items-center gap-2 bg-white border rounded-xl p-1 self-start sm:self-auto">
                    <button onClick={() => setSortBy('score')}
                        className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                            sortBy === 'score' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'
                        )}
                    >
                        <Star className="h-3.5 w-3.5 inline mr-1" />Score
                    </button>
                    <button onClick={() => setSortBy('votes')}
                        className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                            sortBy === 'votes' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'
                        )}
                    >
                        <TrendingUp className="h-3.5 w-3.5 inline mr-1" />Votes
                    </button>
                </div>
            </div>

            {/* ── Top 3 Podium ── */}
            {!isLoading && ranked.length >= 3 && (
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-2">
                    {[ranked[1], ranked[0], ranked[2]].map((item, podiumIdx) => {
                        const actualRank = podiumIdx === 0 ? 2 : podiumIdx === 1 ? 1 : 3;
                        const colorGradient = RANK_COLORS[actualRank - 1];
                        const Icon = RANK_ICONS[actualRank - 1];
                        const height = actualRank === 1 ? 'h-28 sm:h-32' : actualRank === 2 ? 'h-20 sm:h-24' : 'h-16 sm:h-20';

                        return (
                            <motion.div key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: podiumIdx * 0.1 }}
                                className="flex flex-col items-center gap-1"
                            >
                                <div className="text-center px-1 w-full">
                                    <p className="text-[10px] sm:text-xs font-bold truncate">{item.title}</p>
                                    <p className="text-[9px] text-muted-foreground truncate">{item.author}</p>
                                </div>
                                <div className={cn(
                                    'w-full rounded-t-xl flex flex-col items-center justify-end pb-2 sm:pb-3 gap-1',
                                    `bg-gradient-to-b ${colorGradient}`,
                                    height
                                )}>
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

            {/* ── Full Ranking List ── */}
            <div className="glass-card rounded-2xl overflow-hidden">

                {/* Table header — mobile: Rank + Title + Score only */}
                <div className="grid grid-cols-12 gap-2 px-3 sm:px-4 py-2.5 bg-gray-50 border-b text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <div className="col-span-2 sm:col-span-1">Rank</div>
                    <div className="col-span-6 sm:col-span-5">Title</div>
                    <div className="col-span-2 hidden sm:block">Type</div>
                    <div className="col-span-2 hidden sm:block">Author</div>
                    <div className="col-span-4 sm:col-span-2 text-right">
                        {sortBy === 'score' ? 'Score' : 'Votes'}
                    </div>
                </div>

                {isLoading && (
                    <div className="flex items-center justify-center h-40 text-muted-foreground">
                        <Trophy className="h-8 w-8 animate-bounce opacity-30" />
                    </div>
                )}

                {!isLoading && ranked.map((item, index) => {
                    const isTop3 = item.rank <= 3;
                    const RankIcon = isTop3 ? RANK_ICONS[item.rank - 1] : null;

                    return (
                        <motion.div key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className={cn(
                                'grid grid-cols-12 gap-2 px-3 sm:px-4 py-3 items-center border-b last:border-0 hover:bg-amber-50/40 transition-colors',
                                isTop3 && 'bg-amber-50/60'
                            )}
                        >
                            {/* Rank */}
                            <div className="col-span-2 sm:col-span-1 flex items-center">
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

                            {/* Title + mobile sub-info */}
                            <div className="col-span-6 sm:col-span-5 min-w-0">
                                <p className="text-sm font-semibold truncate">{item.title}</p>
                                {/* Show type + author inline on mobile since those cols are hidden */}
                                <p className="text-[10px] text-muted-foreground truncate sm:hidden capitalize mt-0.5">
                                    {item.type} · {item.author}
                                </p>
                            </div>

                            {/* Type — desktop only */}
                            <div className="col-span-2 hidden sm:block">
                                <span className="text-xs capitalize px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                                    {item.type}
                                </span>
                            </div>

                            {/* Author — desktop only */}
                            <div className="col-span-2 hidden sm:block">
                                <p className="text-xs text-muted-foreground truncate">{item.author}</p>
                            </div>

                            {/* Score / Votes */}
                            <div className="col-span-4 sm:col-span-2 text-right">
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
                                    <div
                                        className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                                        style={{ width: `${sortBy === 'score' ? item.score : Math.min(item.votes, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                {!isLoading && ranked.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                        <Trophy className="h-12 w-12 mb-3 opacity-20" />
                        <p className="text-sm">No content to rank yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}
