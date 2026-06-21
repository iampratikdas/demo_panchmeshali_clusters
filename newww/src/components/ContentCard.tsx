import type { Content } from '../types/content';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { StatusBadge } from './StatusBadge';
import { MarksDisplay } from './MarksDisplay';
import { FileText, BookOpen, Calendar, User, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';

interface ContentCardProps {
    content: Content;
    onClick?: () => void;
    canGiveMarks?: boolean;
    canViewMarks?: boolean;
    currentUserUid?: string;
    onGiveMarks?: (content: Content) => void;
}

export function ContentCard({
    content,
    onClick,
    canGiveMarks = false,
    canViewMarks = false,
    currentUserUid,
    onGiveMarks,
}: ContentCardProps) {
    const Icon = content.type === 'story' ? FileText : BookOpen;

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
        >
            <Card
                className="cursor-pointer hover:border-primary/50 transition-all h-full flex flex-col"
                onClick={onClick}
            >
                <CardHeader>
                    <div className="flex items-start flex-col justify-between lg:flex-row md:flex-col sm:flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <Icon className="h-5 w-5 text-primary shrink-0" />
                            <CardTitle className="text-xl">{content.title}</CardTitle>
                        </div>
                        <StatusBadge status={content.status} />
                    </div>
                    <CardDescription className="flex items-center gap-4 mt-2 flex-wrap">
                        <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {content.authorName}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(content.createdAt).toLocaleDateString()}
                        </span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                    <div
                        className="text-sm text-muted-foreground line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: content.content }}
                    />
                    <div className="flex gap-3 mt-4 text-xs text-muted-foreground flex-wrap">
                        <span className="capitalize">{content.type}</span>
                        {content.episodeWise && (
                            <>
                                <span>•</span>
                                <span>{content.episodes?.length ?? 0} episodes</span>
                            </>
                        )}
                        {content.type === 'story' && (
                            <>
                                <span>•</span>
                                <span>{content.wordCount} words</span>
                                {content.genre && (
                                    <>
                                        <span>•</span>
                                        <span>{content.genre}</span>
                                    </>
                                )}
                            </>
                        )}
                        {content.type === 'poem' && (
                            <>
                                <span>•</span>
                                <span>{content.lines} lines</span>
                                {content.style && (
                                    <>
                                        <span>•</span>
                                        <span>{content.style}</span>
                                    </>
                                )}
                            </>
                        )}
                    </div>

                    {canViewMarks && (
                        <MarksDisplay
                            totalMarks={content.totalMarks}
                            marks={content.marks}
                            currentUserUid={currentUserUid}
                        />
                    )}

                    {canGiveMarks && onGiveMarks && (
                        <div className="mt-3 pt-3 border-t border-border/60">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full gap-2"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onGiveMarks(content);
                                }}
                            >
                                <Star className="h-4 w-4 text-amber-500" />
                                Give Marks
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
