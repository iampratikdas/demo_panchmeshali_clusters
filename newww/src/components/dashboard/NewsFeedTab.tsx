import { useAtom } from 'jotai';
import { publishersAtom, newsAtom } from '../../store/dashboardAtoms';
import { useMemo } from 'react';
import { ThumbsUp, MessageSquare, Repeat2, Send, MoreHorizontal } from 'lucide-react';

export function NewsFeedTab() {
    const [publishers] = useAtom(publishersAtom);
    const [news] = useAtom(newsAtom);

    const filteredNews = useMemo(() => {
        const acceptedPublisherIds = new Set(
            publishers.filter(p => p.status === 'Accepted').map(p => p.id)
        );
        return news.filter(article => acceptedPublisherIds.has(article.publisherId));
    }, [publishers, news]);

    const timeAgo = (dateString: string) => {
        const date = new Date(dateString);
        return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
    };

    if (filteredNews.length === 0) {
        return <div className="bg-white dark:bg-card border border-border rounded-xl p-8 text-center text-muted-foreground shadow-sm">No news to display. Accept some publishers to see their news.</div>;
    }

    return (
        <div className="flex flex-col space-y-4">
            {filteredNews.map((article) => {
                const publisher = publishers.find(p => p.id === article.publisherId);
                const publisherName = publisher?.name || 'Unknown';

                return (
                    <article
                        key={article.id}
                        className="bg-white dark:bg-card border border-border rounded-xl shadow-sm overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex gap-3 p-4 pb-2">
                            <div className="w-12 h-12 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-slate-700 font-bold text-lg">
                                {publisherName.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm text-foreground truncate hover:text-blue-600 cursor-pointer transition-colors">{publisherName}</span>
                                        <span className="text-xs text-muted-foreground truncate">{publisher?.email || 'Publisher'}</span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            {timeAgo(article.publishedAt)} • <span className="bg-muted-foreground rounded-full w-1 h-1 inline-block"></span> Edited
                                        </span>
                                    </div>
                                    <button className="text-muted-foreground hover:bg-accent/50 p-2 rounded-full transition-colors flex-shrink-0 self-start -mt-2 -mr-2">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="px-4 pb-3">
                            <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">{article.content}</p>
                        </div>

                        {/* Optional Image placeholder based on title to make it look like a post */}
                        <div className="w-full bg-slate-100 aspect-video flex items-center justify-center border-y border-border">
                            <span className="text-slate-400 font-medium text-lg px-4 text-center">{article.title}</span>
                        </div>

                        {/* Stats */}
                        <div className="px-4 py-2 flex items-center justify-between text-xs text-muted-foreground border-b border-border/50">
                            <div className="flex items-center gap-1">
                                <div className="bg-blue-600 rounded-full p-0.5"><ThumbsUp className="w-3 h-3 text-white fill-white" /></div>
                                <span>{Math.floor(Math.random() * 500) + 20}</span>
                            </div>
                            <div className="flex gap-3">
                                <span>{Math.floor(Math.random() * 100) + 5} comments</span>
                                <span>{Math.floor(Math.random() * 50)} reposts</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between items-center px-2 py-1 text-muted-foreground font-medium text-sm">
                            <button className="flex items-center justify-center gap-2 hover:bg-accent/50 p-3 rounded-lg flex-1 transition-colors">
                                <ThumbsUp className="w-5 h-5" />
                                <span className="hidden sm:inline">Like</span>
                            </button>
                            <button className="flex items-center justify-center gap-2 hover:bg-accent/50 p-3 rounded-lg flex-1 transition-colors">
                                <MessageSquare className="w-5 h-5" />
                                <span className="hidden sm:inline">Comment</span>
                            </button>
                            <button className="flex items-center justify-center gap-2 hover:bg-accent/50 p-3 rounded-lg flex-1 transition-colors">
                                <Repeat2 className="w-5 h-5" />
                                <span className="hidden sm:inline">Repost</span>
                            </button>
                            <button className="flex items-center justify-center gap-2 hover:bg-accent/50 p-3 rounded-lg flex-1 transition-colors">
                                <Send className="w-5 h-5" />
                                <span className="hidden sm:inline">Send</span>
                            </button>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}
