import type { Content } from '../types/content';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { StatusBadge } from './StatusBadge';
import { FileText, BookOpen, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface ContentCardProps {
    content: Content;
    onClick?: () => void;
}

export function ContentCard({ content, onClick }: ContentCardProps) {
    const icon = content.type === 'story' ? FileText : BookOpen;
    const Icon = icon;

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
        >
            <Card
                className="cursor-pointer hover:border-primary/50 transition-all"
                onClick={onClick}
            >
                <CardHeader>
                    <div className="flex items-start flex-col justify-between lg:flex-row md:flex-col sm:flex-col">
                        <div className="flex items-center gap-2">
                            <Icon className="h-5 w-5 text-primary" />
                            <CardTitle className="text-xl">{content.title}</CardTitle>
                        </div>
                        <StatusBadge status={content.status} />
                    </div>
                    <CardDescription className="flex items-center gap-4 mt-2">
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
                <CardContent>
                    <div
                        className="text-sm text-muted-foreground line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: content.content }}
                    />
                    <div className="flex gap-3 mt-4 text-xs text-muted-foreground">
                        <span className="capitalize">{content.type}</span>
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
                </CardContent>
            </Card>
        </motion.div>
    );
}
