import { motion } from 'framer-motion';
import { Star, TrendingUp } from 'lucide-react';
import type { ContentMark } from '../types/content';

interface MarksDisplayProps {
    totalMarks?: number;
    marks?: ContentMark[];
    currentUserUid?: string;
    compact?: boolean;
}

const AVATAR_GRADIENTS = [
    'from-amber-400 to-orange-500',
    'from-yellow-400 to-amber-500',
    'from-orange-400 to-red-400',
];

export function MarksDisplay({
    totalMarks = 0,
    marks = [],
    currentUserUid,
    compact = false,
}: MarksDisplayProps) {
    const myMark = currentUserUid
        ? marks.find((m) => m.uid === currentUserUid)?.score
        : undefined;
    const hasBreakdown = marks.length > 0;

    if (totalMarks === 0 && !hasBreakdown) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/50"
            >
                <Star className="h-3.5 w-3.5" />
                No marks yet
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={`relative overflow-hidden rounded-xl border border-amber-200/60 bg-gradient-to-br from-amber-50 via-orange-50/80 to-yellow-50 ${
                compact ? 'px-4 py-3' : 'mt-3 pt-4 px-4 py-4 border-t-0'
            }`}
        >
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-amber-300/20 blur-2xl pointer-events-none" />
            <div className="absolute -left-2 -bottom-2 h-16 w-16 rounded-full bg-orange-300/15 blur-xl pointer-events-none" />

            <div className="relative flex flex-wrap items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-200/50">
                    <Star className="h-5 w-5 fill-white text-white" />
                </div>
                <div>
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-amber-700/80">
                        Total Score
                    </p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent leading-tight">
                        {totalMarks}
                    </p>
                </div>
                {myMark !== undefined && (
                    <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium bg-white/70 backdrop-blur-sm text-amber-800 px-3 py-1.5 rounded-full border border-amber-200/60 shadow-sm">
                        <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
                        Your mark: {myMark}
                    </span>
                )}
            </div>

            {!compact && hasBreakdown && (
                <div className="relative flex flex-wrap gap-2 mt-3 pt-3 border-t border-amber-200/40">
                    {marks.map((m, i) => (
                        <motion.span
                            key={m.uid || i}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.06 }}
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold text-white px-2.5 py-1 rounded-full bg-gradient-to-r ${AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]} shadow-sm`}
                        >
                            <Star className="h-3 w-3 fill-white/90" />
                            {m.score}
                        </motion.span>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
