import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { useAtom } from 'jotai';
import { useNavigate } from '@tanstack/react-router';
import { publishersAtom, type Publisher } from '../../store/dashboardAtoms';
import { fetchPublisherList, requestJoinPublisher, removePublisherAssignment } from '../../lib/api';
import { resolveMediaUrl } from '../../lib/publishPreviewUtils';
import { Button } from '../../ui/button';
import { cn } from '../../lib/utils';
import { UserPlus, Loader2, RefreshCw, Building2, Eye, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

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
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
    }, []);
    return { toasts, show };
}

function PublisherAvatar({ pub }: { pub: Publisher }) {
    const logo = resolveMediaUrl(pub.logo_url);
    const [failed, setFailed] = useState(false);

    if (logo && !failed) {
        return (
            <img
                src={logo}
                alt=""
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover ring-2 ring-white shadow-sm shrink-0"
                onError={() => setFailed(true)}
            />
        );
    }

    return (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            {pub.name?.charAt(0)?.toUpperCase() ?? '?'}
        </div>
    );
}

interface PublisherRowProps {
    pub: Publisher;
    index: number;
    loadingUid: string | null;
    onJoin: (pub: Publisher) => void;
    onNavigate: (pid: string) => void;
}

function PublisherRow({ pub, index, loadingUid, onJoin, onNavigate }: PublisherRowProps) {
    const isBusy = loadingUid === pub.pid;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-b-0"
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                    type="button"
                    onClick={() => onNavigate(pub.pid)}
                    className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 text-left group flex-1"
                >
                    <PublisherAvatar pub={pub} />
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm sm:text-base text-foreground truncate group-hover:text-violet-600 transition-colors">
                            {pub.name}
                        </p>
                        {pub.description && (
                            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-2 sm:line-clamp-1">
                                {pub.description}
                            </p>
                        )}
                        {pub.email && (
                            <p className="text-[11px] text-muted-foreground/80 mt-1 truncate">{pub.email}</p>
                        )}
                    </div>
                </button>

                <div className="flex gap-2 w-full sm:w-auto sm:shrink-0">
                    <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 sm:flex-none h-10 rounded-xl border-slate-200 font-medium"
                        onClick={() => onNavigate(pub.pid)}
                    >
                        <Eye className="w-4 h-4 mr-1.5 shrink-0" />
                        View
                    </Button>
                    <Button
                        size="sm"
                        disabled={isBusy}
                        className="flex-1 sm:flex-none h-10 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-sm"
                        onClick={() => onJoin(pub)}
                    >
                        {isBusy ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <UserPlus className="w-4 h-4 mr-1.5 shrink-0" />
                                Join
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}

function EmptyState({
    icon: Icon,
    title,
    action,
}: {
    icon: typeof Building2;
    title: string;
    action?: ReactNode;
}) {
    return (
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 p-10 sm:p-12 flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                <Icon className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {action}
        </div>
    );
}

export function PublishersTab() {
    const [publishers, setPublishers] = useAtom(publishersAtom);
    const [loading, setLoading] = useState(false);
    const [loadingUid, setLoadingUid] = useState<string | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const { toasts, show: showToast } = useToast();
    const navigate = useNavigate();

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
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                'Failed to load publishers.';
            setFetchError(msg);
        } finally {
            setLoading(false);
        }
    }, [setPublishers]);

    useEffect(() => {
        loadPublishers();
    }, [loadPublishers]);

    const handleJoin = async (pub: Publisher) => {
        setLoadingUid(pub.pid);
        try {
            await requestJoinPublisher(pub.pid);
            loadPublishers();
            showToast(`Join request sent to ${pub.name}!`, 'success');
        } catch (err: unknown) {
            const status = (err as { response?: { status?: number; data?: { message?: string } } })?.response?.status;
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                'Failed to send request.';
            if (status === 409) {
                showToast('Request already exists.', 'error');
            } else {
                showToast(msg, 'error');
            }
        } finally {
            setLoadingUid(null);
        }
    };

    if (loading) {
        return (
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 p-12 flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
                <span className="text-sm text-muted-foreground">Loading publishers…</span>
            </div>
        );
    }

    if (fetchError) {
        return (
            <EmptyState
                icon={Building2}
                title={fetchError}
                action={
                    <Button size="sm" variant="outline" onClick={loadPublishers} className="gap-2 rounded-xl mt-2">
                        <RefreshCw className="w-4 h-4" /> Retry
                    </Button>
                }
            />
        );
    }

    if (publishers.length === 0) {
        return (
            <EmptyState
                icon={Building2}
                title="No publishers found."
                action={
                    <Button size="sm" variant="outline" onClick={loadPublishers} className="gap-2 rounded-xl mt-2">
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </Button>
                }
            />
        );
    }

    return (
        <>
            <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm sm:max-w-xs ml-auto">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={cn(
                            'px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white pointer-events-auto',
                            t.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'
                        )}
                    >
                        {t.message}
                    </div>
                ))}
            </div>

            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 overflow-hidden">
                <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-violet-500" />
                        <h2 className="text-sm sm:text-base font-semibold text-foreground">Suggested for you</h2>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                            {publishers.length}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={loadPublishers}
                        disabled={loading}
                        className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 transition-colors touch-manipulation"
                        title="Refresh"
                    >
                        <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
                    </button>
                </div>

                <div>
                    {publishers.map((pub, index) => (
                        <PublisherRow
                            key={pub.pid}
                            pub={pub}
                            index={index}
                            loadingUid={loadingUid}
                            onJoin={handleJoin}
                            onNavigate={(pid) => navigate({ to: '/publishers/$pid', params: { pid } })}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}
