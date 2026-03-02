import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Comment } from '../types/content';
import { addComment } from '../lib/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { MessageSquare, Send } from 'lucide-react';
import { useToast } from '../hooks/useToast';

interface CommentBoxProps {
    contentId: string;
    comments: Comment[];
}

export function CommentBox({ contentId, comments }: CommentBoxProps) {
    const [newComment, setNewComment] = useState('');
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
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim()) {
            addCommentMutation.mutate(newComment);
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comments ({comments.length})
            </h3>

            <div className="space-y-3">
                {comments.map((comment) => (
                    <Card key={comment.id} className={comment.isReviewer ? 'border-primary/50 bg-primary/5' : ''}>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <p className="font-medium text-sm">
                                        {comment.authorName}
                                        {comment.isReviewer && (
                                            <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                                                Reviewer
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(comment.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm">{comment.text}</p>
                        </CardContent>
                    </Card>
                ))}

                {comments.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        No comments yet. Be the first to comment!
                    </p>
                )}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1"
                />
                <Button
                    type="submit"
                    size="icon"
                    disabled={!newComment.trim() || addCommentMutation.isPending}
                >
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </div>
    );
}
