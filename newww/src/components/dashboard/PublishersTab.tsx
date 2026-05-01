import { useAtom } from 'jotai';
import { publishersAtom, type PublisherStatus } from '../../store/dashboardAtoms';
import { Button } from '../../ui/button';
import { cn } from '../../lib/utils';
import { Check, X, UserPlus } from 'lucide-react';

export function PublishersTab() {
    const [publishers, setPublishers] = useAtom(publishersAtom);

    const handleStatusChange = (id: string, status: PublisherStatus) => {
        setPublishers(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    };

    if (publishers.length === 0) {
        return <div className="bg-white dark:bg-card border border-border rounded-xl p-8 text-center text-muted-foreground shadow-sm">No publishers found.</div>;
    }

    return (
        <div className="bg-white dark:bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <h2 className="text-base font-bold p-4 border-b border-border/50 text-foreground">Suggested for you</h2>
            <div className="flex flex-col">
                {publishers.map((pub, index) => {
                    const handle = pub.name.toLowerCase().replace(/\s+/g, '');
                    const isLast = index === publishers.length - 1;

                    return (
                        <div
                            key={pub.id}
                            className={cn(
                                "flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-accent/30 transition-colors gap-4",
                                !isLast && "border-b border-border/50"
                            )}
                        >
                            <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                                {/* Avatar */}
                                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-slate-700 font-bold text-lg sm:text-xl">
                                    {pub.name.charAt(0)}
                                </div>

                                <div className="flex-1 min-w-0 pt-1 sm:pt-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm sm:text-base text-foreground truncate hover:underline hover:text-blue-600 cursor-pointer">{pub.name}</span>
                                        <div className={cn(
                                            'text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider',
                                            pub.status === 'Accepted' && 'text-green-700 bg-green-100',
                                            pub.status === 'Rejected' && 'text-red-700 bg-red-100',
                                            pub.status === 'Pending' && 'text-yellow-700 bg-yellow-100'
                                        )}>
                                            {pub.status}
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground truncate text-xs sm:text-sm mt-0.5">Contributor at {pub.name.split(' ')[0]} Media</p>
                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{pub.email}</p>
                                </div>
                            </div>

                            <div className="flex gap-2 sm:ml-4 flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                                {pub.status !== 'Accepted' && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="rounded-full flex-1 sm:flex-none border-blue-600 text-blue-600 hover:bg-blue-50 font-bold"
                                        onClick={(e) => { e.stopPropagation(); handleStatusChange(pub.id, 'Accepted'); }}
                                    >
                                        <Check className="w-4 h-4 mr-1.5 hidden sm:block" />
                                        <UserPlus className="w-4 h-4 mr-1.5 sm:hidden" />
                                        Accept
                                    </Button>
                                )}

                                {pub.status !== 'Rejected' && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="rounded-full flex-1 sm:flex-none font-bold text-muted-foreground hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                                        onClick={(e) => { e.stopPropagation(); handleStatusChange(pub.id, 'Rejected'); }}
                                    >
                                        <X className="w-4 h-4 mr-1.5" />
                                        Reject
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            <button className="w-full p-3 text-sm font-bold text-muted-foreground hover:bg-accent/50 transition-colors border-t border-border/50">
                Show more
            </button>
        </div>
    );
}
