import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
    fetchContentById,
    fetchCommentsByContentId,
    addContentMarks,
} from '../lib/api';
import { canUserComment, canUserGiveMarks, canUserViewMarks } from '../lib/contentMapper';
import { MarksDisplay } from '../components/MarksDisplay';
import { ContentMarkModal } from '../components/ContentMarkModal';
import { useAtomValue } from 'jotai';
import { currentUserAtom } from '../store/atoms';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { Button } from '../ui/button';
import { StatusBadge } from '../components/StatusBadge';
import { CommentBox } from '../components/CommentBox';
import {
    ArrowLeft,
    Calendar,
    User,
    FileText,
    BookOpen,
    Eye,
    Star,
    Clock,
    Lock,
    X,
    Layers,
    Hash,
    type LucideIcon,
} from 'lucide-react';
import type { Episode } from '../types/content';

const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

function formatViews(views: number): string {
    if (views >= 1000) return `${(views / 1000).toFixed(0)}K+`;
    return `${views}`;
}

function MetaPill({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground/70 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/80 shadow-sm">
            <Icon className="h-3.5 w-3.5 text-primary" />
            {children}
        </span>
    );
}

interface EpisodeCardProps {
    episode: Episode;
    index: number;
    onClick?: () => void;
}

function EpisodeCard({ episode, index, onClick }: EpisodeCardProps) {
    const dateStr = new Date(episode.createdAt).toLocaleDateString('bn-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    const isClickable = !episode.isPremium && !!episode.htmlContent;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
            whileHover={isClickable ? { y: -4, scale: 1.01 } : undefined}
            whileTap={isClickable ? { scale: 0.98 } : undefined}
            className={`group relative overflow-hidden rounded-2xl border p-4 transition-colors duration-300 ${
                isClickable
                    ? 'cursor-pointer border-border/60 bg-white/80 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10'
                    : 'border-amber-200/50 bg-gradient-to-br from-amber-50/50 to-orange-50/30 opacity-95'
            }`}
            onClick={isClickable ? onClick : undefined}
        >
            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-full transition-all duration-300 ${
                isClickable
                    ? 'bg-gradient-to-b from-primary/40 to-indigo-400/40 group-hover:from-primary group-hover:to-indigo-500'
                    : 'bg-gradient-to-b from-amber-400 to-orange-400'
            }`} />

            <div className="flex items-start justify-between gap-3 pl-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-[11px] font-bold text-primary">
                            {episode.episodeNumber}
                        </span>
                        <p className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                            {episode.title}
                        </p>
                    </div>

                    {episode.isPremium ? (
                        <p className="text-xs text-amber-700 mt-2 font-medium">{episode.premiumMessage}</p>
                    ) : (
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2.5 flex-wrap">
                            {episode.views !== undefined && (
                                <span className="inline-flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-full">
                                    <Eye className="h-3 w-3 text-blue-500" />
                                    {formatViews(episode.views)}
                                </span>
                            )}
                            {episode.rating !== undefined && (
                                <span className="inline-flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full">
                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                    {episode.rating}
                                </span>
                            )}
                            {episode.readTimeMinutes !== undefined && (
                                <span className="inline-flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-full">
                                    <Clock className="h-3 w-3 text-emerald-500" />
                                    {episode.readTimeMinutes} মিনিট
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex-shrink-0">
                    {episode.isPremium ? (
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 border border-amber-200/60">
                            <Lock className="h-4 w-4 text-amber-600" />
                        </div>
                    ) : (
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap bg-muted/40 px-2 py-1 rounded-lg">
                            {dateStr}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

interface EpisodeViewerProps {
    episode: Episode;
    onClose: () => void;
}

function EpisodeViewer({ episode, onClose }: EpisodeViewerProps) {
    const dateStr = new Date(episode.createdAt).toLocaleDateString('bn-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-md p-4 pt-10 overflow-y-auto"
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: 24 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 24 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-border/50 overflow-hidden"
                >
                    <div className="relative px-6 py-5 border-b bg-gradient-to-r from-primary/[0.06] via-indigo-50/80 to-violet-50/60">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.08),transparent_60%)]" />
                        <div className="relative flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full mb-2">
                                    <Layers className="h-3 w-3" />
                                    Episode {episode.episodeNumber}
                                </span>
                                <h2 className="text-xl font-bold leading-snug">{episode.title}</h2>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2.5 flex-wrap">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> {dateStr}
                                    </span>
                                    {episode.views !== undefined && (
                                        <span className="flex items-center gap-1">
                                            <Eye className="h-3 w-3" /> {formatViews(episode.views)}
                                        </span>
                                    )}
                                    {episode.rating !== undefined && (
                                        <span className="flex items-center gap-1">
                                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                            {episode.rating}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-xl hover:bg-white/80 transition-colors flex-shrink-0 border border-transparent hover:border-border/50"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 pb-8 max-h-[60vh] overflow-y-auto">
                        {episode.htmlContent ? (
                            <div
                                className="prose prose-sm max-w-none prose-headings:text-foreground"
                                dangerouslySetInnerHTML={{ __html: episode.htmlContent }}
                            />
                        ) : (
                            <p className="text-muted-foreground text-sm text-center py-8">No content available.</p>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default function ContentDetail() {
    const { id } = useParams({ from: '/content/$id' });
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
    const [markModalOpen, setMarkModalOpen] = useState(false);
    const user = useAtomValue(currentUserAtom);
    const canComment = canUserComment(user.role);
    const canGiveMarks = canUserGiveMarks(user.role);
    const canViewMarks = canUserViewMarks(user.role);

    const { data: content, isLoading: contentLoading } = useQuery({
        queryKey: ['content', id],
        queryFn: () => fetchContentById(id),
    });

    const markMutation = useMutation({
        mutationFn: (payload: { marks: number; status: string }) =>
            addContentMarks({
                cont_id: id,
                marks: payload.marks,
                status: payload.status,
                eid: content?.eid,
                event: !!content?.eid,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['content', id] });
            queryClient.invalidateQueries({ queryKey: ['contents'] });
            setMarkModalOpen(false);
        },
    });

    const initialMarks = content?.marks?.find((m) => m.uid === user.uid)?.score ?? 0;

    const { data: comments = [], isLoading: commentsLoading } = useQuery({
        queryKey: ['comments', id],
        queryFn: () => fetchCommentsByContentId(id),
    });

    if (contentLoading) {
        return <LoadingSkeleton />;
    }

    if (!content) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Content not found</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate({ to: '/content' })}>
                    Back to Content List
                </Button>
            </div>
        );
    }

    const isEpisodeWise = !!content.episodeWise;
    const episodes = content.episodes ?? [];
    const Icon = content.type === 'story' ? FileText : BookOpen;

    return (
        <>
            <AnimatePresence>
                {selectedEpisode && (
                    <EpisodeViewer
                        episode={selectedEpisode}
                        onClose={() => setSelectedEpisode(null)}
                    />
                )}
            </AnimatePresence>

            <motion.div
                variants={pageVariants}
                initial="hidden"
                animate="visible"
                className="mx-auto max-w-4xl space-y-6 pb-8"
            >
                <motion.div variants={itemVariants}>
                    <Button
                        variant="ghost"
                        onClick={() => navigate({ to: '/content' })}
                        className="mb-2 -ml-2 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Content
                    </Button>
                </motion.div>

                <motion.article
                    variants={itemVariants}
                    className="glass-card rounded-2xl overflow-hidden border border-white/60 shadow-xl shadow-primary/[0.06]"
                >
                    {/* Hero header */}
                    <div className="relative px-6 sm:px-8 pt-8 pb-6 bg-gradient-to-br from-primary/[0.07] via-indigo-50/90 to-violet-50/70 border-b border-primary/10">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.12),transparent_55%)] pointer-events-none" />
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-indigo-300/10 blur-3xl pointer-events-none" />

                        <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-indigo-600 shadow-lg shadow-primary/25">
                                    <Icon className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
                                        {content.title}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-2 mt-3">
                                        <MetaPill icon={User}>{content.authorName}</MetaPill>
                                        <MetaPill icon={Calendar}>
                                            {new Date(content.createdAt).toLocaleDateString()}
                                        </MetaPill>
                                        <MetaPill icon={Hash}>
                                            <span className="capitalize">{content.type}</span>
                                        </MetaPill>
                                        {content.type === 'story' && (
                                            <MetaPill icon={FileText}>{content.wordCount} words</MetaPill>
                                        )}
                                        {content.type === 'poem' && (
                                            <MetaPill icon={BookOpen}>{content.lines} lines</MetaPill>
                                        )}
                                        {content.type === 'story' && content.genre && (
                                            <span className="text-xs font-medium text-indigo-700 bg-indigo-100/80 px-3 py-1.5 rounded-full border border-indigo-200/50">
                                                {content.genre}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <StatusBadge status={content.status} />
                        </div>

                        {canViewMarks && (
                            <div className="relative mt-5 flex flex-col sm:flex-row sm:items-stretch gap-3">
                                <div className="flex-1">
                                    <MarksDisplay
                                        totalMarks={content.totalMarks}
                                        marks={content.marks}
                                        currentUserUid={user.uid ?? undefined}
                                        compact
                                    />
                                </div>
                                {canGiveMarks && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        className="gap-2 shrink-0 self-end sm:self-center bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-md shadow-amber-200/50 hover:shadow-lg transition-all hover:scale-[1.02]"
                                        onClick={() => setMarkModalOpen(true)}
                                    >
                                        <Star className="h-4 w-4 fill-white/90" />
                                        Give Marks
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Body */}
                    <div className="px-6 sm:px-8 py-6">
                        {!isEpisodeWise && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="prose prose-sm max-w-none prose-headings:text-foreground rounded-xl bg-white/50 p-5 border border-border/40"
                                dangerouslySetInnerHTML={{ __html: content.content }}
                            />
                        )}

                        {isEpisodeWise && content.content && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="prose prose-sm max-w-none mb-8 prose-headings:text-foreground rounded-xl bg-white/50 p-5 border border-border/40"
                                dangerouslySetInnerHTML={{ __html: content.content }}
                            />
                        )}

                        {isEpisodeWise && episodes.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-indigo-100">
                                        <Layers className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold">Chapters</h2>
                                        <p className="text-xs text-muted-foreground">{episodes.length} episodes available</p>
                                    </div>
                                </div>
                                <motion.div
                                    variants={pageVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="grid grid-cols-1 md:grid-cols-2 gap-3"
                                >
                                    {episodes.map((episode, index) => (
                                        <EpisodeCard
                                            key={episode.id}
                                            episode={episode}
                                            index={index}
                                            onClick={() => setSelectedEpisode(episode)}
                                        />
                                    ))}
                                </motion.div>
                            </div>
                        )}
                    </div>

                    {/* Comments */}
                    <div className="px-6 sm:px-8 py-6 border-t border-border/50 bg-gradient-to-b from-muted/20 to-transparent">
                        {commentsLoading ? (
                            <LoadingSkeleton />
                        ) : (
                            <CommentBox contentId={id} comments={comments} canComment={canComment} />
                        )}
                    </div>
                </motion.article>
            </motion.div>

            <ContentMarkModal
                open={markModalOpen}
                content={content}
                initialMarks={initialMarks}
                onClose={() => setMarkModalOpen(false)}
                onSubmit={(payload) => markMutation.mutate(payload)}
                isLoading={markMutation.isPending}
            />
        </>
    );
}
