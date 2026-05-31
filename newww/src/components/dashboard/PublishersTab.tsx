import { useEffect, useState, useCallback } from 'react';
import { useAtom } from 'jotai';
import { publishersAtom, type Publisher, type AssignmentStatus } from '../../store/dashboardAtoms';
import { fetchPublisherList, requestJoinPublisher, removePublisherAssignment } from '../../lib/api';
import { Button } from '../../ui/button';
import { cn } from '../../lib/utils';
import { Check, X, UserPlus, Loader2, RefreshCw, Building2 } from 'lucide-react';

// ── Tiny inline toast ─────────────────────────────────────────────────────────
interface ToastItem {
    id: number;
    message: string;
    type: 'success' | 'error';
}

let toastId = 0;

function useToast() {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const show = useCallback((message: string, type: ToastItem['type'] = 'success') => {
        const id = ++toastId;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    }, []);

    return { toasts, show };
}

// ── Status badge helper ───────────────────────────────────────────────────────
function StatusBadge({ status }: { status: AssignmentStatus }) {
    const styles: Record<AssignmentStatus, string> = {
        Accepted: 'text-green-700 bg-green-100',
        Pending: 'text-yellow-700 bg-yellow-100',
        Rejected: 'text-red-700 bg-red-100',
        Removed: 'text-slate-600 bg-slate-100',
    };
    return (
        <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider', styles[status])}>
            {status}
        </span>
    );
}

// ── Publisher row ─────────────────────────────────────────────────────────────
interface PublisherRowProps {
    pub: Publisher;
    isLast: boolean;
    loadingUid: string | null;
    onJoin: (pub: Publisher) => void;
    onRemove: (pub: Publisher) => void;
}

function PublisherRow({ pub, isLast, loadingUid, onJoin, onRemove }: PublisherRowProps) {
    // const isBusy = loadingUid === pub.pid;
    const status = pub.status;

    return (
        <div
            className={cn(
                'flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-accent/30 transition-colors gap-4',
                !isLast && 'border-b border-border/50',
            )}
        >
            {/* Left: Avatar + info */}
            <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-slate-700 font-bold text-lg sm:text-xl select-none">
                    {pub.name?.charAt(0) ?? '?'}
                </div>

                <div className="flex-1 min-w-0 pt-1 sm:pt-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm sm:text-base text-foreground truncate hover:underline hover:text-blue-600 cursor-pointer">
                            {pub.name}
                        </span>
                        {/* <StatusBadge status={status} /> */}
                    </div>
                    {pub.description && (
                        <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 truncate">{pub.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{pub.email}</p>
                </div>
            </div>

            {/* Right: Action buttons */}
            <div className="flex gap-2 sm:ml-4 flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                {/* Show "Join" only when there is no existing assignment (status is Removed or the assignment_id is falsy) */}
                {(status === 'Removed') && (
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={false}
                        className="rounded-full flex-1 sm:flex-none border-blue-600 text-blue-600 hover:bg-blue-50 font-bold"
                        onClick={() => onJoin(pub)}
                    >

                        <UserPlus className="w-4 h-4 mr-1.5" />

                        Join
                    </Button>
                )}

                {/* Show "Requested" (disabled) when pending */}
                {status === 'Pending' && (
                    <Button
                        size="sm"
                        variant="outline"
                        disabled
                        className="rounded-full flex-1 sm:flex-none border-yellow-500 text-yellow-600 bg-yellow-50 font-bold cursor-not-allowed"
                    >
                        <Check className="w-4 h-4 mr-1.5" />
                        Requested
                    </Button>
                )}

                {/* Show "Accepted" label (non-interactive) when accepted */}
                {status === 'Accepted' && (
                    <span className="flex items-center gap-1.5 text-sm font-bold text-green-600 px-3 py-1.5 bg-green-50 rounded-full border border-green-200">
                        <Check className="w-4 h-4" />
                        Joined
                    </span>
                )}

                {/* Show "Cancel / Remove" when pending or accepted */}
                {(status === 'Pending' || status === 'Accepted') && (
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={false}
                        className="rounded-full flex-1 sm:flex-none font-bold text-muted-foreground hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                        onClick={() => onRemove(pub)}
                    >
                        {false ? (
                            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                        ) : (
                            <X className="w-4 h-4 mr-1.5" />
                        )}
                        {status === 'Accepted' ? 'Leave' : 'Cancel'}
                    </Button>
                )}
            </div>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────
export function PublishersTab() {
    const [publishers, setPublishers] = useAtom(publishersAtom);
    const [loading, setLoading] = useState(false);
    const [loadingUid, setLoadingUid] = useState<string | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const { toasts, show: showToast } = useToast();

    // ── Fetch publisher list ──────────────────────────────────────────────────
    const loadPublishers = useCallback(async () => {
        const uid = localStorage.getItem('uid');
        if (!uid) {
            setFetchError('User session not found. Please log in again.');
            return;
        }
        setLoading(true);
        setFetchError(null);
        try {
            const data = await fetchPublisherList(uid);
            setPublishers(data as Publisher[]);
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? 'Failed to load publishers.';
            setFetchError(msg);
        } finally {
            setLoading(false);
        }
    }, [setPublishers]);

    useEffect(() => {
        loadPublishers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Join request ──────────────────────────────────────────────────────────
    const handleJoin = async (pub: Publisher) => {
        setLoadingUid(pub.pid);
        try {
            await requestJoinPublisher(pub.pid);
            // Optimistically mark as Pending + generate a temporary assignment_id
            setPublishers(prev =>
                prev.map(p =>
                    p.pid === pub.pid
                        ? { ...p, status: 'Pending', assignment_id: 'pending_' + pub.pid }
                        : p
                )
            );
            showToast(`Join request sent to ${pub.name}!`, 'success');
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? 'Failed to send request.';
            // If already exists, reflect it in the UI
            if (err?.response?.status === 409) {
                setPublishers(prev =>
                    prev.map(p =>
                        p.pid === pub.pid
                            ? { ...p, status: 'Pending', assignment_id: 'pending_' + pub.pid }
                            : p
                    )
                );
                showToast('Request already exists.', 'error');
            } else {
                showToast(msg, 'error');
            }
        } finally {
            setLoadingUid(null);
        }
    };

    // ── Remove / cancel ───────────────────────────────────────────────────────
    const handleRemove = async (pub: Publisher) => {
        setLoadingUid(pub.pid);
        try {
            await removePublisherAssignment(pub.pid);
            // Optimistically mark as Removed and clear assignment_id
            setPublishers(prev =>
                prev.map(p =>
                    p.pid === pub.pid
                        ? { ...p, status: 'Removed', assignment_id: '' }
                        : p
                )
            );
            showToast(`Removed from ${pub.name}.`, 'success');
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? 'Failed to remove assignment.';
            showToast(msg, 'error');
        } finally {
            setLoadingUid(null);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    console.log("publishers Atom", publishers)
    if (loading) {
        return (
            <div className="bg-white dark:bg-card border border-border rounded-xl shadow-sm p-8 flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="w-7 h-7 animate-spin text-green-600" />
                <span className="text-sm font-medium">Loading publishers…</span>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="bg-white dark:bg-card border border-border rounded-xl shadow-sm p-8 flex flex-col items-center gap-3 text-center">
                <Building2 className="w-10 h-10 text-muted-foreground/40" />
                <p className="text-sm font-medium text-red-500">{fetchError}</p>
                <Button size="sm" variant="outline" onClick={loadPublishers} className="gap-2">
                    <RefreshCw className="w-4 h-4" /> Retry
                </Button>
            </div>
        );
    }

    if (publishers.length === 0) {
        return (
            <div className="bg-white dark:bg-card border border-border rounded-xl shadow-sm p-8 flex flex-col items-center gap-3 text-center text-muted-foreground">
                <Building2 className="w-10 h-10 text-muted-foreground/40" />
                <p className="text-sm font-medium">No publishers found.</p>
                <Button size="sm" variant="outline" onClick={loadPublishers} className="gap-2">
                    <RefreshCw className="w-4 h-4" /> Refresh
                </Button>
            </div>
        );
    }

    return (
        <>
            {/* Toast container */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={cn(
                            'px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white pointer-events-auto transition-all duration-300',
                            t.type === 'success' ? 'bg-green-600' : 'bg-red-500',
                        )}
                    >
                        {t.message}
                    </div>
                ))}
            </div>

            {/* Publisher list card */}
            <div className="bg-white dark:bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                    <h2 className="text-base font-bold text-foreground">Suggested for you</h2>
                    <button
                        onClick={loadPublishers}
                        disabled={loading}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-accent/50"
                        title="Refresh publisher list"
                    >
                        <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
                    </button>
                </div>

                <div className="flex flex-col">
                    {publishers.map((pub, index) => (
                        <PublisherRow
                            key={pub.pid}
                            pub={pub}
                            isLast={index === publishers.length - 1}
                            loadingUid={loadingUid}
                            onJoin={handleJoin}
                            onRemove={handleRemove}
                        />
                    ))}
                </div>

                <button
                    className="w-full p-3 text-sm font-bold text-muted-foreground hover:bg-accent/50 transition-colors border-t border-border/50"
                    onClick={loadPublishers}
                >
                    Show more
                </button>
            </div>
        </>
    );
}
