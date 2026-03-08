import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchContents } from '../lib/api';
import { BookOpen, ChevronDown, ChevronRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

/**
 * BookPreviewItem — one book row inside the collapsible list.
 * Clicking it expands to show a 2-line excerpt + star rating mock.
 */
function BookPreviewItem({ title, author, excerpt, type }: {
    title: string;
    author: string;
    excerpt: string;
    type: string;
}) {
    const [open, setOpen] = useState(false);
    // Stable "star" rating derived from title length so it doesn't change per render
    const stars = ((title.length % 3) + 3);   // always 3, 4, or 5

    return (
        <div
            className={cn(
                'rounded-lg transition-colors cursor-pointer overflow-hidden',
                open ? 'bg-white/10' : 'hover:bg-white/5'
            )}
        >
            {/* Header row */}
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-start gap-2.5 px-2.5 py-2 text-left"
            >
                {/* Book icon with type colour */}
                <div className={cn(
                    'mt-0.5 p-1.5 rounded-md flex-shrink-0',
                    type === 'story' ? 'bg-indigo-500/30 text-indigo-300' : 'bg-pink-500/30 text-pink-300'
                )}>
                    <BookOpen className="h-3.5 w-3.5" />
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white leading-tight truncate">{title}</p>
                    <p className="text-[10px] text-white/50 truncate mt-0.5">{author}</p>
                </div>

                <ChevronDown className={cn(
                    'h-3.5 w-3.5 text-white/40 flex-shrink-0 mt-1 transition-transform',
                    open && 'rotate-180'
                )} />
            </button>

            {/* Expandable preview */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-2.5 pb-2.5 space-y-2">
                            {/* Stars */}
                            <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        className={cn(
                                            'h-3 w-3',
                                            i < stars ? 'fill-amber-400 text-amber-400' : 'text-white/20'
                                        )}
                                    />
                                ))}
                                <span className="text-[10px] text-white/40 ml-1">{stars}.0</span>
                            </div>

                            {/* Excerpt */}
                            <p className="text-[11px] text-white/60 leading-relaxed line-clamp-3">
                                {excerpt}
                            </p>

                            {/* Read more nudge */}
                            <button className="flex items-center gap-1 text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                                Read more <ChevronRight className="h-3 w-3" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/**
 * BookPreviewList
 * A collapsible sidebar widget that shows book-type submissions (stories/poems).
 * Render this inside the sidebar Layout.
 */
export function BookPreviewList() {
    const [collapsed, setCollapsed] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['contents', 1, 10],
        queryFn: () => fetchContents(1, 10),
    });

    // Use all story/poem submissions as "book previews"
    const books = (data?.data ?? []).filter(c =>
        c.type === 'story' || c.type === 'poem'
    ).slice(0, 5);

    return (
        <div className="mt-4 border-t border-white/10 pt-4">
            {/* Section header */}
            <button
                onClick={() => setCollapsed(c => !c)}
                className="w-full flex items-center justify-between px-2 mb-2 group"
            >
                <div className="flex items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5 text-white/40 group-hover:text-white/60 transition-colors" />
                    <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider group-hover:text-white/60 transition-colors">
                        Top Sales Previews
                    </h3>
                </div>
                <ChevronDown className={cn(
                    'h-3.5 w-3.5 text-white/30 transition-transform',
                    collapsed && '-rotate-90'
                )} />
            </button>

            <AnimatePresence>
                {!collapsed && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div className="space-y-0.5">
                            {isLoading && (
                                <div className="space-y-2 px-2 py-1">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-8 rounded-lg bg-white/5 animate-pulse" />
                                    ))}
                                </div>
                            )}

                            {!isLoading && books.length === 0 && (
                                <p className="text-[11px] text-white/30 px-2 py-1">No books found</p>
                            )}

                            {!isLoading && books.map(book => (
                                <BookPreviewItem
                                    key={book.id}
                                    title={book.title}
                                    author={book.authorName ?? 'Unknown'}
                                    excerpt={book.content?.replace(/<[^>]+>/g, '').slice(0, 120) ?? ''}
                                    type={book.type}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
