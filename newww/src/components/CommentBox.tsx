import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import type { Comment } from '../types/content';
import { addComment } from '../lib/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { MessageSquare, Send, Sparkles } from 'lucide-react';
import { useToast } from '../hooks/useToast';

interface CommentBoxProps {
    contentId: string;
    comments: Comment[];
    canComment?: boolean;
}

const AVATAR_PALETTES = [
    'from-blue-500 to-indigo-600',
    'from-violet-500 to-purple-600',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-500',
    'from-cyan-500 to-blue-600',
];

function getInitials(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('') || '?';
}

function getAvatarGradient(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
}

function formatCommentDate(value: string): string {
    return new Date(value).toLocaleString(undefined, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

interface CommentItemProps {
    comment: Comment;
    index: number;
}

function CommentItem({ comment, index }: CommentItemProps) {
    const gradient = getAvatarGradient(comment.authorName);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -16, y: 8 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 16, scale: 0.96 }}
            transition={{ duration: 0.35, delay: index * 0.07, ease: 'easeOut' }}
            className={`group relative rounded-2xl border p-4 transition-all duration-300 ${
                comment.isReviewer
                    ? 'border-primary/25 bg-gradient-to-br from-primary/[0.06] to-indigo-50/80 shadow-sm shadow-primary/5 hover:shadow-md hover:shadow-primary/10'
                    : 'border-border/60 bg-white/70 backdrop-blur-sm hover:border-border hover:shadow-md hover:shadow-black/[0.04]'
            }`}
        >
            {comment.isReviewer && (
                <div className="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-gradient-to-b from-primary to-indigo-500" />
            )}

            <div className="flex gap-3">
                <div
                    className={`flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-sm font-bold shadow-md ring-2 ring-white`}
                >
                    {getInitials(comment.authorName)}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-semibold text-sm text-foreground">{comment.authorName}</p>
                        {comment.isReviewer && (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide font-bold bg-gradient-to-r from-primary to-indigo-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                                <Sparkles className="h-2.5 w-2.5" />
                                Reviewer
                            </span>
                        )}
                        <span className="text-[11px] text-muted-foreground ml-auto">
                            {formatCommentDate(comment.createdAt)}
                        </span>
                    </div>
                    <p className="text-sm text-foreground/85 leading-relaxed">{comment.text}</p>
                </div>
            </div>
        </motion.div>
    );
}

export function CommentBox({ contentId, comments, canComment = false }: CommentBoxProps) {
    const [newComment, setNewComment] = useState('');
    const [focused, setFocused] = useState(false);
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const addCommentMutation = useMutation({
        mutationFn: (text: string) => addComment(contentId, text),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', contentId] });
            setNewComment('');
            toast({
                title: 'Comment added',
                description: 'Your comment has been posted successfully.',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Failed to add comment',
                description: error.message || 'You may not have permission to comment.',
                variant: 'destructive',
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim() && canComment) {
            addCommentMutation.mutate(newComment);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="space-y-5"
        >
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-indigo-100 border border-primary/20">
                    <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div>
                    <h3 className="text-lg font-bold tracking-tight">Comments</h3>
                    <p className="text-xs text-muted-foreground">{comments.length} feedback {comments.length === 1 ? 'entry' : 'entries'}</p>
                </div>
            </div>

            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {comments.map((comment, index) => (
                        <CommentItem key={comment.id} comment={comment} index={index} />
                    ))}
                </AnimatePresence>

                {comments.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12 rounded-2xl border border-dashed border-border/70 bg-muted/20"
                    >
                        <MessageSquare className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">No comments yet</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">Be the first to share feedback</p>
                    </motion.div>
                )}
            </div>

            {canComment ? (
                <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`relative flex gap-2 p-2 rounded-2xl border transition-all duration-300 ${
                        focused
                            ? 'border-primary/40 bg-white shadow-lg shadow-primary/5 ring-2 ring-primary/10'
                            : 'border-border/60 bg-white/80 backdrop-blur-sm'
                    }`}
                >
                    <Input
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        placeholder="Share your feedback..."
                        className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-11"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!newComment.trim() || addCommentMutation.isPending}
                        className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#cb8959] to-[#b8734a] hover:from-[#b8734a] hover:to-[#a66540] text-white shadow-md shadow-[#cb8959]/30 transition-all hover:scale-105 active:scale-95 shrink-0"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </motion.form>
            ) : (
                <p className="text-xs text-muted-foreground text-center py-2 px-4 rounded-xl bg-muted/30 border border-border/40">
                    Only publishers, admins, writers, and proofreaders can add comments.
                </p>
            )}
        </motion.div>
    );
}
