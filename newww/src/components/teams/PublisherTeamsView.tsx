import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, CheckCircle, XCircle, UserMinus, Search,
    Star, BookOpen, RefreshCw, Inbox, ServerCrash
} from 'lucide-react';
import { fetchTeamRequests, updateTeamRequest, fetchPublisherProfile } from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../ui/button';
import { TeamStatusBadge } from './TeamStatusBadge';
import { WriterDetailModal } from './WriterDetailModal';
import { ConfirmModal } from './ConfirmModal';
import { useAtom } from 'jotai';
import { currentUserAtom } from '../../store/atoms';

type FilterTab = 'all' | 'Pending' | 'Accepted' | 'Rejected';

// ─── Skeleton Loader ────────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div className="bg-card border border-border/40 rounded-2xl p-5 animate-pulse space-y-3">
            <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-xl bg-muted flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/2 bg-muted rounded" />
                    <div className="h-3 w-3/4 bg-muted rounded" />
                </div>
                <div className="h-6 w-20 bg-muted rounded-full" />
            </div>
            <div className="flex gap-2 mt-2">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-4 w-20 bg-muted rounded" />
            </div>
            <div className="flex gap-2 pt-1">
                <div className="h-8 flex-1 bg-muted rounded-lg" />
                <div className="h-8 flex-1 bg-muted rounded-lg" />
            </div>
        </div>
    );
}

// ─── Writer Card ────────────────────────────────────────────────────────────
function WriterCard({
    request,
    onViewDetail,
    onAccept,
    onReject,
    onRemove,
    loadingUid,
}: {
    request: any;
    onViewDetail: (r: any) => void;
    onAccept: (uid: string) => void;
    onReject: (uid: string) => void;
    onRemove: (uid: string) => void;
    loadingUid: string | null;
}) {
    const w = request.writer;
    if (!w) return null;

    const initials = w.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '??';
    const isLoading = loadingUid === w.uid;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group bg-primary-100 border border-border/40 rounded-2xl p-5 hover:border-primary/20 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => onViewDetail(request)}
        >
            <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {w.profileImage ? (
                        <img src={w.profileImage} alt={w.full_name} className="h-full w-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                    ) : (
                        <span className="text-lg font-bold text-violet-400">{initials}</span>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {w.full_name}
                        </h3>
                        <TeamStatusBadge status={request.status} />
                    </div>
                    {w.bio && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 italic">"{w.bio}"</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            {w.stories_count ?? 0} stories
                        </span>
                        <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {w.followers_count ?? 0} followers
                        </span>
                        <span className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                            {(w.average_rating ?? 0).toFixed(1)}
                        </span>
                        {w.skills && (
                            <span className="capitalize bg-muted px-2 py-0.5 rounded-full">{w.skills}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div
                className="flex gap-2 mt-4 pt-4 border-t border-border/30"
                onClick={e => e.stopPropagation()}
            >
                {request.status === 'Pending' && (
                    <>
                        <Button
                            size="sm"
                            className="flex-1 bg-red-500 hover:bg-emerald-600 text-white gap-1.5"
                            disabled={isLoading}
                            onClick={() => onAccept(w.uid)}
                        >
                            <CheckCircle className="h-3.5 w-3.5" />
                            Accept
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-red-500/30 text-red-500 hover:bg-red-500/10 gap-1.5"
                            disabled={isLoading}
                            onClick={() => onReject(w.uid)}
                        >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                        </Button>
                    </>
                )}
                {request.status === 'Accepted' && (
                    <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-red-500/30 text-red-500 hover:bg-red-500/10 gap-1.5"
                        disabled={isLoading}
                        onClick={() => onRemove(w.uid)}
                    >
                        <UserMinus className="h-3.5 w-3.5" />
                        Remove from Team
                    </Button>
                )}
                {request.status === 'Rejected' && (
                    <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-1.5"
                        disabled={isLoading}
                        onClick={() => onAccept(w.uid)}
                    >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Re-accept
                    </Button>
                )}
                {isLoading && (
                    <div className="flex-1 flex items-center justify-center py-1.5">
                        <span className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export function PublisherTeamsView() {
    const { toast, toasts } = useToast();
    const queryClient = useQueryClient();
    const [filterTab, setFilterTab] = useState<FilterTab>('all');
    const [search, setSearch] = useState('');
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
    const [confirmAction, setConfirmAction] = useState<{
        type: 'Accepted' | 'Rejected' | 'Cancelled';
        writerUid: string;
        writerName: string;
    } | null>(null);
    const [loadingUid, setLoadingUid] = useState<string | null>(null);

    const [user] = useAtom(currentUserAtom);

    const { data, isLoading, isError, refetch: refetchRequests } = useQuery({
        queryKey: ['team-requests'],
        queryFn: fetchTeamRequests,
        staleTime: 30_000,
    });

    const requests: any[] = data?.data ?? [];
    const firstRequestPid = requests[0]?.pid;

    const { data: publisherProfile, refetch: refetchProfile } = useQuery({
        queryKey: ['publisher-profile', firstRequestPid],
        queryFn: () => fetchPublisherProfile(firstRequestPid),
        staleTime: 60_000,
        enabled: !!firstRequestPid,
    });

    const publisherInfo = publisherProfile || data?.publisher || {
        name: user.name || 'Publisher',
        logo_url: '',
    };

    const refetch = () => {
        refetchRequests();
        refetchProfile();
    };

    const mutation = useMutation({
        mutationFn: ({ uid, type }: { uid: string; type: 'Accepted' | 'Rejected' | 'Cancelled' }) =>
            updateTeamRequest(uid, type),
        onSuccess: (_, { type }) => {
            const msgs = { Accepted: 'Writer accepted! ✅', Rejected: 'Request rejected.', Cancelled: 'Writer removed from team.' };
            toast({ title: msgs[type] || 'Done' });
            queryClient.invalidateQueries({ queryKey: ['team-requests'] });
            setSelectedRequest(null);
            setConfirmAction(null);
            setLoadingUid(null);
        },
        onError: (err: any) => {
            toast({ title: 'Error', description: err?.response?.data?.message || 'Action failed.', variant: 'destructive' });
            setLoadingUid(null);
        },
    });

    const handleAction = (uid: string, type: 'Accepted' | 'Rejected' | 'Cancelled', writerName: string) => {
        if (type === 'Accepted') {
            setLoadingUid(uid);
            mutation.mutate({ uid, type });
        } else {
            setConfirmAction({ type, writerUid: uid, writerName });
        }
    };

    const confirmLabels = {
        Rejected: { title: 'Reject writer request?', desc: (name: string) => `${name}'s join request will be rejected.`, label: 'Reject', variant: 'warning' as const },
        Cancelled: { title: 'Remove writer from team?', desc: (name: string) => `${name} will be removed from your team.`, label: 'Remove', variant: 'danger' as const },
        Accepted: { title: '', desc: () => '', label: '', variant: 'warning' as const },
    };

    // Filter & search
    const filtered = requests.filter(r => {
        const matchTab = filterTab === 'all' || r.status === filterTab;
        const name = r.writer?.full_name?.toLowerCase() ?? '';
        const matchSearch = !search || name.includes(search.toLowerCase());
        return matchTab && matchSearch;
    });

    const tabCounts = {
        all: requests.length,
        Pending: requests.filter(r => r.status === 'Pending').length,
        Accepted: requests.filter(r => r.status === 'Accepted').length,
        Rejected: requests.filter(r => r.status === 'Rejected').length,
    };

    const tabs: { key: FilterTab; label: string }[] = [
        { key: 'all', label: `All (${tabCounts.all})` },
        { key: 'Pending', label: `Requests (${tabCounts.Pending})` },
        { key: 'Accepted', label: `Team (${tabCounts.Accepted})` },
        { key: 'Rejected', label: `Rejected (${tabCounts.Rejected})` },
    ];

    return (
        <div className="space-y-6">
            {/* Toast notifications */}
            <div className="fixed bottom-6 right-6 z-[200] space-y-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map(t => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, x: 60 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 60 }}
                            className={`pointer-events-auto min-w-[260px] px-4 py-3 rounded-xl shadow-xl border text-sm font-medium ${t.variant === 'destructive' ? 'bg-red-500 text-white border-red-600' : 'bg-card text-foreground border-border'}`}
                        >
                            <span className="font-semibold">{t.title}</span>
                            {t.description && <p className="text-xs opacity-80 mt-0.5">{t.description}</p>}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Publisher info banner */}
            {publisherInfo && (
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-xl border border-primary/10">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/10 flex items-center justify-center overflow-hidden">
                        {publisherInfo.logo_url ? (
                            <img src={publisherInfo.logo_url} alt={publisherInfo.name} className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-xs font-bold text-primary">{publisherInfo.name?.[0]?.toUpperCase()}</span>
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-foreground">{publisherInfo.name}</p>
                        <p className="text-xs text-muted-foreground">Managing your writer team</p>
                    </div>
                    <div className="ml-auto">
                        <button onClick={() => refetch()} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                            <RefreshCw className="h-4 w-4 text-muted-foreground" />
                        </button>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-muted/50 rounded-xl border border-border/40 overflow-x-auto">
                {tabs.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setFilterTab(key)}
                        className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterTab === key
                            ? 'bg-background text-foreground shadow-sm border border-border/30'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search writer by name..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
                </div>
            ) : isError ? (
                <div className="flex flex-col items-center gap-4 py-20 text-center">
                    <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center">
                        <ServerCrash className="h-8 w-8 text-red-500" />
                    </div>
                    <div>
                        <p className="font-semibold text-foreground">Failed to load team requests</p>
                        <p className="text-sm text-muted-foreground mt-1">Could not reach the server. Please try again.</p>
                    </div>
                    <Button variant="outline" onClick={() => refetch()} className="gap-2">
                        <RefreshCw className="h-4 w-4" /> Retry
                    </Button>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-20 text-center">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                        <Inbox className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="font-semibold text-foreground">
                            {filterTab === 'all' ? 'No writer requests yet' : `No ${filterTab.toLowerCase()} requests`}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {filterTab === 'Pending' ? 'Writers who send join requests will appear here.' : 'Change the filter to see other requests.'}
                        </p>
                    </div>
                </div>
            ) : (
                <AnimatePresence mode="popLayout">
                    <div className="grid  grid-cols-1 md:grid-cols-2 gap-4">
                        {filtered.map(r => (
                            <WriterCard
                                key={r.assignment_id}
                                request={r}
                                onViewDetail={setSelectedRequest}
                                onAccept={uid => handleAction(uid, 'Accepted', r.writer?.full_name || 'Writer')}
                                onReject={uid => handleAction(uid, 'Rejected', r.writer?.full_name || 'Writer')}
                                onRemove={uid => handleAction(uid, 'Cancelled', r.writer?.full_name || 'Writer')}
                                loadingUid={loadingUid}
                            />
                        ))}
                    </div>
                </AnimatePresence>
            )}

            {/* Writer Detail Modal */}
            <WriterDetailModal
                open={!!selectedRequest}
                writer={selectedRequest?.writer}
                assignmentStatus={selectedRequest?.status}
                onClose={() => setSelectedRequest(null)}
                onAccept={() => selectedRequest && handleAction(selectedRequest.writer?.uid, 'Accepted', selectedRequest.writer?.full_name)}
                onReject={() => selectedRequest && handleAction(selectedRequest.writer?.uid, 'Rejected', selectedRequest.writer?.full_name)}
                onRemove={() => selectedRequest && handleAction(selectedRequest.writer?.uid, 'Cancelled', selectedRequest.writer?.full_name)}
                isActionLoading={mutation.isPending}
            />

            {/* Confirm Modal */}
            {confirmAction && confirmLabels[confirmAction.type] && (
                <ConfirmModal
                    open={!!confirmAction}
                    onClose={() => setConfirmAction(null)}
                    onConfirm={() => {
                        setLoadingUid(confirmAction.writerUid);
                        mutation.mutate({ uid: confirmAction.writerUid, type: confirmAction.type });
                    }}
                    title={confirmLabels[confirmAction.type].title}
                    description={confirmLabels[confirmAction.type].desc(confirmAction.writerName)}
                    confirmLabel={confirmLabels[confirmAction.type].label}
                    variant={confirmLabels[confirmAction.type].variant}
                    isLoading={mutation.isPending}
                />
            )}
        </div>
    );
}
