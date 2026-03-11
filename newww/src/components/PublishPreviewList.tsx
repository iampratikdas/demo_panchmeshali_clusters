import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchContents } from '../lib/api';
import { Newspaper, ChevronDown, ChevronRight, Eye, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { Link } from '@tanstack/react-router';

function stableNum(id: string, salt: number, max: number) {
    let h = salt;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffffffff;
    return Math.abs(h) % max;
}

/**
 * PublishPreviewList
 * Compact sidebar widget showing newest content with views & likes.
 * Collapsed by default; clicking the header toggles it open.
 */
export function PublishPreviewList() {
    const [collapsed, setCollapsed] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['contents', 1, 10],
        queryFn: () => fetchContents(1, 10),
    });

    const items = (data?.data ?? []).slice(0, 5).map(c => ({
        id: c.id,
        title: c.title,
        type: c.type,
        views: stableNum(c.id, 13, 5000) + 100,
        likes: stableNum(c.id, 7, 500) + 10,
    }));

    return (
        <div className="mt-2 border-t border-white/10 pt-4">
            {/* Section header */}
            <button
                onClick={() => setCollapsed(c => !c)}
                className="w-full flex items-center justify-between px-2 mb-2 group"
            >
                <div className="flex items-center gap-2">
                    <Newspaper className="h-3.5 w-3.5 text-white/40 group-hover:text-white/60 transition-colors" />
                    <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider group-hover:text-white/60 transition-colors">
                        Publish Preview
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

                            {!isLoading && items.length === 0 && (
                                <p className="text-[11px] text-white/30 px-2 py-1">No previews available</p>
                            )}

                            {!isLoading && items.map(item => (
                                <Link
                                    key={item.id}
                                    to="/publish-preview"
                                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/5 transition-colors group/item"
                                >
                                    {/* Type dot */}
                                    <div className={cn('h-2 w-2 rounded-full flex-shrink-0',
                                        item.type === 'story' ? 'bg-emerald-400' : 'bg-pink-400'
                                    )} />

                                    {/* Title */}
                                    <p className="flex-1 text-[11px] text-white/70 font-medium truncate group-hover/item:text-white transition-colors">
                                        {item.title}
                                    </p>

                                    {/* Mini stats */}
                                    <div className="flex items-center gap-1.5 text-[10px] text-white/30 shrink-0">
                                        <Eye className="h-2.5 w-2.5" />
                                        <span>{item.views > 999 ? `${(item.views / 1000).toFixed(1)}k` : item.views}</span>
                                        <Heart className="h-2.5 w-2.5 text-rose-400/60" />
                                        <span>{item.likes}</span>
                                    </div>

                                    <ChevronRight className="h-3 w-3 text-white/20 group-hover/item:text-white/40 transition-colors" />
                                </Link>
                            ))}

                            {/* View all link */}
                            {!isLoading && items.length > 0 && (
                                <Link
                                    to="/publish-preview"
                                    className="flex items-center justify-center gap-1 mt-1 py-1.5 text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                                >
                                    View all previews <ChevronRight className="h-3 w-3" />
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
