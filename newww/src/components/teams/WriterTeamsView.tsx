import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building, Star, Users, Search,
    RefreshCw, LogOut, Inbox, ServerCrash, Plus, Globe, MessageSquare
} from 'lucide-react';
import { fetchPublisherList, leavePublisherTeam, requestJoinPublisherByPid, fetchTeamRequestsByUid, createChat } from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { useAtom } from 'jotai';
import { currentUserAtom } from '../../store/atoms';
import { Button } from '../../ui/button';
import { TeamStatusBadge } from './TeamStatusBadge';
import { PublisherDetailModal } from './PublisherDetailModal';
import { ConfirmModal } from './ConfirmModal';

// ─── Skeleton Loader ────────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div className="bg-card border border-border/40 rounded-2xl p-5 animate-pulse space-y-3">
            <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-muted flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/2 bg-muted rounded" />
                    <div className="h-3 w-3/4 bg-muted rounded" />
                </div>
                <div className="h-6 w-20 bg-muted rounded-full" />
            </div>
            <div className="h-12 w-full bg-muted rounded-lg" />
            <div className="flex gap-2">
                <div className="h-3 w-20 bg-muted rounded" />
                <div className="h-3 w-16 bg-muted rounded" />
            </div>
            <div className="h-8 w-full bg-muted rounded-lg" />
        </div>
    );
}

// ─── Publisher Card (My Teams) ───────────────────────────────────────────────
function PublisherCard({
    assignment,
    onViewDetail,
    onLeave,
    onChat,
    isLeaving,
}: {
    assignment: any;
    onViewDetail: (a: any) => void;
    onLeave: (pid: string, name: string) => void;
    onChat: (publisherUid: string) => void;
    isLeaving: boolean;
}) {
    const pub = assignment; // merged publisher_details
    const memberCount = Array.isArray(pub.uids) ? pub.uids.length : 0;
    console.log("pub data ==============>", pub)
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group bg-secondary border border-border/40 rounded-2xl p-5 hover:border-primary/20 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => onViewDetail(assignment)}
        >
            {/* Publisher header */}
            <div className="flex items-start gap-4 mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {pub.logo_url ? (
                        <img src={pub.logo_url} alt={pub.name} className="h-full w-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                    ) : (
                        <Building className="h-6 w-6 text-blue-500" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">{pub.name}</h3>
                        <TeamStatusBadge status={pub.assignment_status || 'Accepted'} />
                    </div>
                    {pub.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{pub.description}</p>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    {memberCount} member{memberCount !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    {(pub.average_rating ?? 0).toFixed(1)} rating
                </span>

            </div>

            {/* Action buttons */}
            <div onClick={e => e.stopPropagation()} className="flex gap-2">
                {pub.assignment_status === 'Accepted' && (
                    <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-2 border-primary/30 text-primary hover:bg-primary/10"
                        onClick={() => {
                            const publisherUid = pub.uids?.[0];
                            if (publisherUid) onChat(publisherUid);
                        }}
                    >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Chat
                    </Button>
                )}
                <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-red-500/20 text-red-500 hover:bg-red-500/10 gap-2"
                    disabled={isLeaving}
                    onClick={() => onLeave(pub.pid, pub.name)}
                >
                    {isLeaving ? (
                        <span className="h-4 w-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                    ) : (
                        <LogOut className="h-3.5 w-3.5" />
                    )}
                    Leave Team
                </Button>
            </div>
        </motion.div>
    );
}

// ─── Discover Tab ────────────────────────────────────────────────────────────
function DiscoverPublishers({ existingPids }: { existingPids: Set<string> }) {
    const { toast, toasts } = useToast();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [joiningPid, setJoiningPid] = useState<string | null>(null);

    const [user] = useAtom(currentUserAtom);
    const { data: companies = [], isLoading } = useQuery({
        queryKey: ['publisher-companies-discover', user.uid],
        queryFn: () => fetchPublisherList(user.uid!),
        staleTime: 60_000,
        enabled: !!user.uid,
    });

    const joinMutation = useMutation({
        mutationFn: (pid: string) => requestJoinPublisherByPid(pid),
        onSuccess: () => {
            toast({ title: 'Join request sent! ✅' });
            queryClient.invalidateQueries({ queryKey: ['team-requests-by-uid', user.uid] });
            queryClient.invalidateQueries({ queryKey: ['publisher-lists', user.uid] });
            setJoiningPid(null);
        },
        onError: (err: any) => {
            toast({ title: 'Error', description: err?.response?.data?.message || 'Failed to send request.', variant: 'destructive' });
            setJoiningPid(null);
        },
    });

    const filtered = companies.filter((c: any) => {
        if (existingPids.has(c.pid)) return false; // already in team
        if (!search) return true;
        return c.name?.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <div className="space-y-4">
            {/* Toast */}
            <div className="fixed bottom-6 right-6 z-[200] space-y-2 pointer-events-none ">
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

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search publishers..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-16 text-center">
                    <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                        <Globe className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">No available publishers to join.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((company: any) => (
                        <motion.div
                            key={company.pid}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card border border-border/40 rounded-2xl p-5 hover:shadow-md transition-all"
                        >
                            <div className="flex items-start gap-3 mb-3">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {company.logo_url ? (
                                        <img src={company.logo_url} alt={company.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <Building className="h-5 w-5 text-blue-500" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm text-foreground truncate">{company.name}</h4>
                                    {company.description && (
                                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{company.description}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                                <span className="flex items-center gap-1">
                                    <Users className="h-3.5 w-3.5" />
                                    {Array.isArray(company.uids) ? company.uids.length : 0} members
                                </span>
                                <span className={`px-2 py-0.5 rounded-full ${company.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                                    {company.status}
                                </span>
                            </div>
                            <Button
                                size="sm"
                                className="w-full gap-2"
                                disabled={joiningPid === company.pid}
                                onClick={() => { setJoiningPid(company.pid); joinMutation.mutate(company.pid); }}
                            >
                                {joiningPid === company.pid ? (
                                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Plus className="h-3.5 w-3.5" />
                                )}
                                Send Join Request
                            </Button>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function WriterTeamsView() {
    const [user] = useAtom(currentUserAtom);
    const { toast, toasts } = useToast();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'my-publishers' | 'discover'>('my-publishers');
    const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
    const [confirmLeave, setConfirmLeave] = useState<{ pid: string; name: string } | null>(null);
    const [leavingPid, setLeavingPid] = useState<string | null>(null);

    // ─── Single query: API returns array of { _id, publisher_details }
    const {
        data: teamRequestData,
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ['team-requests-by-uid', user.uid],
        queryFn: () => fetchTeamRequestsByUid(),
        staleTime: 30_000,
        enabled: !!user.uid,
    });

    // Map each array item → flat publisher object enriched with assignment_status
    const publisherList: any[] = Array.isArray(teamRequestData?.data)
        ? teamRequestData.data.map((item: any) => ({
            ...item.publisher_details,   // name, pid, description, logo_url, status, uids, email, phone, etc.
            request_id: item._id,        // keep the request doc _id
            // All items from team_requests_by_uid are active connections → show "Accepted" badge on card.
            // The publisher's own account status (Active/Inactive) stays in `status` from publisher_details.
            assignment_status: item.assignment_status,
        }))
        : [];
    // console.log("publisherList =============> ", publisherList, teamRequestData)
    const leaveMutation = useMutation({
        mutationFn: (pid: string) => leavePublisherTeam(pid),
        onSuccess: () => {
            toast({ title: 'Left publisher team successfully.' });
            queryClient.invalidateQueries({ queryKey: ['team-requests-by-uid', user.uid] });
            queryClient.invalidateQueries({ queryKey: ['publisher-lists', user.uid] });
            setConfirmLeave(null);
            setSelectedAssignment(null);
            setLeavingPid(null);
        },
        onError: (err: any) => {
            toast({ title: 'Error', description: err?.response?.data?.message || 'Failed to leave team.', variant: 'destructive' });
            setLeavingPid(null);
        },
    });

    // Show all publishers in "My Publishers"; filter accepted if needed in future
    const acceptedPublishers = publisherList; // all entries from this endpoint are already linked
    const existingPids = new Set<string>(publisherList.map((p: any) => p.pid).filter(Boolean));

    const handleChat = async (publisherUid: string) => {
        try {
            const chat = await createChat(publisherUid);
            if (chat?.chatId) {
                sessionStorage.setItem('pendingChatId', chat.chatId);
            }
            navigate({ to: '/chats' });
        } catch (err: any) {
            toast({ title: 'Error', description: err?.response?.data?.message || 'Could not open chat.', variant: 'destructive' });
        }
    };

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

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-muted/50 rounded-xl border border-border/40 w-fit">
                {[
                    { key: 'my-publishers' as const, label: `My Publishers (${acceptedPublishers.length})` },
                    { key: 'discover' as const, label: 'Discover' },
                ].map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === key
                            ? 'bg-background text-foreground shadow-sm border border-border/30'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'my-publishers' ? (
                    <motion.div key="my" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        {/* Refresh */}
                        <div className="flex justify-end mb-4">
                            <button onClick={() => refetch()} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                                <RefreshCw className="h-3.5 w-3.5" /> Refresh
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                            </div>
                        ) : isError ? (
                            <div className="flex flex-col items-center gap-4 py-20 text-center">
                                <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center">
                                    <ServerCrash className="h-8 w-8 text-red-500" />
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">Failed to load publishers</p>
                                    <p className="text-sm text-muted-foreground mt-1">Could not reach the server.</p>
                                </div>
                                <Button variant="outline" onClick={() => refetch()} className="gap-2">
                                    <RefreshCw className="h-4 w-4" /> Retry
                                </Button>
                            </div>
                        ) : acceptedPublishers.length === 0 ? (
                            <div className="flex flex-col items-center gap-4 py-20 text-center">
                                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                                    <Inbox className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">Not part of any publisher yet</p>
                                    <p className="text-sm text-muted-foreground mt-1">Go to Discover to send join requests to publishers.</p>
                                </div>
                                <Button onClick={() => setActiveTab('discover')} className="gap-2">
                                    <Globe className="h-4 w-4" /> Discover Publishers
                                </Button>
                            </div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {acceptedPublishers.map((a: any) => (
                                        <PublisherCard
                                            key={a.pid}
                                            assignment={a}
                                            onViewDetail={setSelectedAssignment}
                                            onLeave={(pid, name) => setConfirmLeave({ pid, name })}
                                            onChat={handleChat}
                                            isLeaving={leavingPid === a.pid}
                                        />
                                    ))}
                                </div>
                            </AnimatePresence>
                        )}
                    </motion.div>
                ) : (
                    <motion.div key="discover" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <DiscoverPublishers existingPids={existingPids} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Publisher Detail Modal */}
            <PublisherDetailModal
                open={!!selectedAssignment}
                publisher={selectedAssignment}
                assignmentStatus={selectedAssignment?.assignment_status}
                onClose={() => setSelectedAssignment(null)}
                onLeave={selectedAssignment ? () => setConfirmLeave({ pid: selectedAssignment.pid, name: selectedAssignment.name }) : undefined}
                onChat={selectedAssignment?.assignment_status === 'Accepted' && selectedAssignment?.uids?.[0]
                    ? () => handleChat(selectedAssignment.uids[0])
                    : undefined
                }
                isActionLoading={leaveMutation.isPending}
            />

            {/* Confirm Leave Modal */}
            <ConfirmModal
                open={!!confirmLeave}
                onClose={() => setConfirmLeave(null)}
                onConfirm={() => {
                    if (confirmLeave) {
                        setLeavingPid(confirmLeave.pid);
                        leaveMutation.mutate(confirmLeave.pid);
                    }
                }}
                title="Leave publisher team?"
                description={`You will be removed from "${confirmLeave?.name}". You can re-join by sending a new request.`}
                confirmLabel="Leave Team"
                variant="danger"
                isLoading={leaveMutation.isPending}
            />
        </div>
    );
}
