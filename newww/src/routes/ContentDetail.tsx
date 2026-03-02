import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from '@tanstack/react-router';
import { fetchContentById, fetchCommentsByContentId } from '../lib/api';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { Card, CardHeader, CardTitle, CardFooter, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { StatusBadge } from '../components/StatusBadge';
import { CommentBox } from '../components/CommentBox';
import { ArrowLeft, Calendar, User, FileText, BookOpen, Eye, Star, Clock, Lock, X } from 'lucide-react';
import type { Episode } from '../types/content';

function formatViews(views: number): string {
    if (views >= 1000) return `${(views / 1000).toFixed(0)}K+`;
    return `${views}`;
}

// ── Episode card ──────────────────────────────────────────────────────────────
interface EpisodeCardProps {
    episode: Episode;
    onClick?: () => void;
}

function EpisodeCard({ episode, onClick }: EpisodeCardProps) {
    const dateStr = new Date(episode.createdAt).toLocaleDateString('bn-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    const isClickable = !episode.isPremium && !!episode.htmlContent;

    return (
        <div
            className={`border rounded-xl p-4 bg-card transition-all ${isClickable
                ? 'hover:border-primary/50 hover:shadow-md cursor-pointer'
                : 'opacity-90'
                }`}
            onClick={isClickable ? onClick : undefined}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-snug line-clamp-2">
                        <span className="text-muted-foreground mr-1">{episode.episodeNumber}.</span>
                        {episode.title}
                    </p>
                    {episode.isPremium ? (
                        <p className="text-xs text-primary mt-1">{episode.premiumMessage}</p>
                    ) : (
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2 flex-wrap">
                            {episode.views !== undefined && (
                                <span className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    {formatViews(episode.views)}
                                </span>
                            )}
                            {episode.rating !== undefined && (
                                <span className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    {episode.rating}
                                </span>
                            )}
                            {episode.readTimeMinutes !== undefined && (
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {episode.readTimeMinutes} মিনিট
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex-shrink-0 text-right">
                    {episode.isPremium ? (
                        <Lock className="h-5 w-5 text-yellow-500" />
                    ) : (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{dateStr}</span>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Episode viewer modal ──────────────────────────────────────────────────────
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
        <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-10 overflow-y-auto"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="relative w-full max-w-2xl bg-card rounded-2xl shadow-2xl border border-border" style={{ background: "white" }}>
                {/* Modal header */}
                <div className="flex items-start justify-between gap-3 p-5 border-b">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">Episode {episode.episodeNumber}</p>
                        <h2 className="text-lg font-bold leading-snug">{episode.title}</h2>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2 flex-wrap">
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
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    {episode.rating}
                                </span>
                            )}
                            {episode.readTimeMinutes !== undefined && (
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> {episode.readTimeMinutes} মিনিট
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Modal body */}
                <div className="p-5 pb-8">
                    {episode.htmlContent ? (
                        <div
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: episode.htmlContent }}
                        />
                    ) : (
                        <p className="text-muted-foreground text-sm">No content available.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ContentDetail() {
    const { id } = useParams({ from: '/content/$id' });
    const navigate = useNavigate();
    const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);

    const { data: content, isLoading: contentLoading } = useQuery({
        queryKey: ['content', id],
        queryFn: () => fetchContentById(id),
    });

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
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate({ to: '/content' })}
                >
                    Back to Content List
                </Button>
            </div>
        );
    }

    const Icon = content.type === 'story' ? FileText : BookOpen;
    const episodes = content.episodes ?? [];

    return (
        <>
            {selectedEpisode && (
                <EpisodeViewer
                    episode={selectedEpisode}
                    onClose={() => setSelectedEpisode(null)}
                />
            )}

            <div className="mx-auto space-y-6">
                <Button
                    variant="ghost"
                    onClick={() => navigate({ to: '/content' })}
                    className="mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Content
                </Button>

                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <Icon className="h-6 w-6 text-primary" />
                                <CardTitle className="text-3xl">{content.title}</CardTitle>
                            </div>
                            <StatusBadge status={content.status} />
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {content.authorName}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(content.createdAt).toLocaleDateString()}
                            </span>
                            <span className="capitalize">{content.type}</span>
                            {content.type === 'story' && (
                                <>
                                    <span>{content.wordCount} words</span>
                                    {content.genre && <span>{content.genre}</span>}
                                </>
                            )}
                            {content.type === 'poem' && (
                                <>
                                    <span>{content.lines} lines</span>
                                    {content.style && <span>{content.style}</span>}
                                </>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: content.content }}
                        />

                        {/* Episodes / Chapters Section */}
                        {episodes.length > 0 && (
                            <div className="space-y-4 mt-6">
                                <h2 className="text-lg font-bold">Chapters</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {episodes.map((episode) => (
                                        <EpisodeCard
                                            key={episode.id}
                                            episode={episode}
                                            onClick={() => setSelectedEpisode(episode)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="flex-col items-start">
                        <div className="w-full border-t pt-6">
                            {commentsLoading ? (
                                <LoadingSkeleton />
                            ) : (
                                <CommentBox contentId={id} comments={comments} />
                            )}
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}
