import { useEffect, useState, useCallback } from 'react';
import { fetchActiveEvents, joinActiveEvent, requestJoinPublisher } from '../../lib/api';
import { Button } from '../../ui/button';
import { cn } from '../../lib/utils';
import {
    Loader2,
    RefreshCw,
    CalendarDays,
    CheckCircle2,
    Calendar,
    BadgeDollarSign,
    BadgeCheck,
    Building2,
    X,
    UserPlus,
} from 'lucide-react';
import moment from 'moment';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ActiveEvent {
    eid: string;
    name: string;
    publisher_name?: string;   // optional — backend may not always return this
    created_by: string;        // publisher uid — used as pid for publisher join request
    paid: boolean;
    pid: string;
    paid_amt?: number;
    event_type?: string;
    st_dt?: string;
    en_dt?: string;
    /**
     * true  → writer already has an Accepted event-request for this event
     * false → writer has NOT joined this event yet
     */
    already_joined: boolean;
    /**
     * true  → writer is an Accepted member of at least one publisher
     *         (backend: findAssignedPublisher({ writer_uid, status: "Accepted" }))
     * false → writer has NO accepted publisher membership → must join publisher first
     */
    team_member: boolean;
    active: boolean;
}

// ── Tiny inline toast (mirrors PublishersTab pattern) ─────────────────────────
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

// ── Date formatter ────────────────────────────────────────────────────────────
function formatDate(unix?: string) {
    if (!unix) return '—';
    const m = moment.unix(Number(unix));
    return m.isValid() ? m.format('DD MMM YYYY') : '—';
}

// ── Join Publisher Modal ──────────────────────────────────────────────────────
interface JoinPublisherModalProps {
    eventName: string;
    onJoin: () => void;
    onClose: () => void;
    joining: boolean;
}
function JoinPublisherModal({ eventName, onJoin, onClose, joining }: JoinPublisherModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />
            {/* Panel */}
            <div className="relative z-10 bg-white dark:bg-card rounded-2xl shadow-2xl border border-border w-full max-w-sm mx-4 p-6 flex flex-col gap-4">
                <button
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                        <Building2 className="w-7 h-7 text-blue-600" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">Publisher Membership Required</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        You must join the publisher's team before you can participate in{' '}
                        <span className="font-semibold text-foreground">"{eventName}"</span>.
                        Send a join request to the publisher first.
                    </p>
                </div>

                <Button
                    className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2"
                    onClick={onJoin}
                    disabled={joining}
                >
                    {joining ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <UserPlus className="w-4 h-4" />
                    )}
                    {joining ? 'Sending Request…' : 'Join Publisher'}
                </Button>
                <Button variant="outline" className="w-full rounded-full" onClick={onClose}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}

// ── Event Card ────────────────────────────────────────────────────────────────
interface EventCardProps {
    event: ActiveEvent;
    isLast: boolean;
    loadingEid: string | null;
    onJoin: (event: ActiveEvent) => void;
    onJoinTeam: (pid: string) => void;
}
function EventCard({ event, isLast, loadingEid, onJoin, onJoinTeam }: EventCardProps) {
    const isBusy = loadingEid === event.eid;
    const now = moment().unix();
    const isExpired = event.en_dt ? Number(event.en_dt) < now : false;

    return (
        <div
            className={cn(
                'flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-accent/30 transition-colors gap-4',
                !isLast && 'border-b border-border/50',
            )}
        >
            {/* Left: Icon + info */}
            <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                {/* Avatar/Icon */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-indigo-100 to-blue-50 flex-shrink-0 flex items-center justify-center">
                    <CalendarDays className="w-6 h-6 text-indigo-500" />
                </div>

                <div className="flex-1 min-w-0 pt-1 sm:pt-0">
                    {/* Title + Paid badge */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm sm:text-base text-foreground truncate">
                            {event.name}
                        </span>
                        {event.paid ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 uppercase tracking-wider flex-shrink-0">
                                <BadgeDollarSign className="w-3 h-3" /> Paid Event
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 uppercase tracking-wider flex-shrink-0">
                                <BadgeCheck className="w-3 h-3" /> Free Event
                            </span>
                        )}
                    </div>

                    {/* Publisher name — show only if returned */}
                    {event.publisher_name && (
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                            By <span className="font-medium text-foreground">{event.publisher_name}</span>
                        </p>
                    )}

                    {/* Membership status badge */}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {event.team_member ? (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
                                ✓ Publisher Member
                            </span>
                        ) : (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-200">
                                Not a Member
                            </span>
                        )}

                        {/* Event type */}
                        {event.event_type && (
                            <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                {event.event_type}
                            </span>
                        )}
                    </div>

                    {/* Dates */}
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(event.st_dt)} – {formatDate(event.en_dt)}
                    </span>
                </div>
            </div>

            {/* Right: Join button */}
            <div className="flex gap-2 sm:ml-4 flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                {event.already_joined ? (
                    <Button
                        size="sm"
                        variant="outline"
                        disabled
                        className="rounded-full flex-1 sm:flex-none border-green-500 text-green-600 bg-green-50 font-bold cursor-default"
                    >
                        <CheckCircle2 className="w-4 h-4 mr-1.5" />
                        Joined
                    </Button>
                ) : isExpired ? (
                    <Button
                        size="sm"
                        variant="outline"
                        disabled
                        className="rounded-full flex-1 sm:flex-none text-muted-foreground border-muted font-bold cursor-default"
                    >
                        Expired
                    </Button>
                ) : (
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={isBusy}
                        className={cn(
                            'rounded-full cursor-pointer flex-1 sm:flex-none font-bold',
                            event.paid
                                ? 'border-amber-500 text-amber-600 hover:bg-amber-50'
                                : event.team_member
                                    ? 'border-blue-600 text-blue-600 hover:bg-blue-50'
                                    : 'border-slate-400 text-slate-500 hover:bg-slate-50',
                        )}
                        onClick={() => onJoin(event)}
                    >
                        {isBusy ? (
                            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                        ) : (
                            <UserPlus className="w-4 h-4 mr-1.5" />
                        )}
                        {event.paid ? 'Join (Paid)' : event.team_member ? 'Join' : 'Join'}
                    </Button>
                )}
            </div>
            {event.team_member === false ? (
                <div className="flex sm:ml-4 flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0">

                    <Button
                        size="sm"
                        variant="outline"
                        disabled={isBusy}
                        className={cn(
                            'rounded-full cursor-pointer flex-1 sm:flex-none font-bold'
                        )}
                        onClick={() => onJoinTeam(event.pid)}
                    >
                        {isBusy ? (
                            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                        ) : (
                            <UserPlus className="w-4 h-4 mr-1.5" />
                        )}
                        Join Team
                    </Button>
                </div>
            ) : null}

        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function ActiveEventsTab() {
    const [events, setEvents] = useState<ActiveEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [loadingEid, setLoadingEid] = useState<string | null>(null);
    const { toasts, show: showToast } = useToast();

    // Modal state — set when writer clicks Join but is NOT a publisher member
    const [modalEvent, setModalEvent] = useState<ActiveEvent | null>(null);
    const [joiningPublisher, setJoiningPublisher] = useState(false);

    // ── Load events ───────────────────────────────────────────────────────────
    const loadEvents = useCallback(async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const data = await fetchActiveEvents();
            setEvents(data);
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? 'Failed to load events.';
            setFetchError(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadEvents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Join flow ─────────────────────────────────────────────────────────────
    /**
     * Logic:
     * 1. Paid event → show toast, stop.
     * 2. event.team_member === false → writer is NOT a publisher member
     *    → show "Join Publisher" modal (do NOT call join API yet)
     * 3. event.team_member === true → writer IS a publisher member
     *    → call joinActiveEvent directly
     */
    const handleJoin = async (event: ActiveEvent) => {
        // Guard: paid events
        if (event.paid) {
            showToast('This is a paid event. Please contact the publisher for payment details.', 'error');
            return;
        }

        // Guard: writer is NOT a publisher member → show modal first
        if (!event.team_member) {
            setModalEvent(event);
            return;
        }

        // Writer IS a publisher member → join the event directly
        setLoadingEid(event.eid);
        try {
            await joinActiveEvent(event.eid, event.pid);
            // Optimistically update UI
            setEvents(prev =>
                prev.map(ev => ev.eid === event.eid ? { ...ev, already_joined: true } : ev)
            );
            showToast(`Successfully joined "${event.name}"!`, 'success');
        } catch (err: any) {
            const status = err?.response?.status;
            if (status === 409) {
                showToast('You have already joined this event.', 'error');
                loadEvents();
            } else {
                const msg = err?.response?.data?.message ?? 'Failed to join event.';
                showToast(msg, 'error');
            }
        } finally {
            setLoadingEid(null);
        }
    };

    // ── Join publisher (from modal) ───────────────────────────────────────────
    /**
     * Writer clicks "Join Publisher" in the modal.
     * Sends a join request to the publisher (status defaults to Accepted per model change).
     * After successful join, attempts to immediately join the event too.
     */
    const handleJoinPublisher = async () => {
        if (!modalEvent) return;
        setJoiningPublisher(true);
        try {
            // Send publisher join request
            await requestJoinPublisher(modalEvent.created_by);
            showToast(`Successfully requested to join the publisher's team!`, 'success');
            setModalEvent(null);

            // Now attempt to join the non-paid event immediately (since join is auto-Accepted)
            setLoadingEid(modalEvent.eid);
            try {
                await joinActiveEvent(modalEvent.eid, modalEvent.pid);
                // Update both team_member and already_joined in local state
                setEvents(prev =>
                    prev.map(ev =>
                        ev.eid === modalEvent.eid
                            ? { ...ev, team_member: true, already_joined: true }
                            : ev
                    )
                );
                showToast(`Successfully joined "${modalEvent.name}"!`, 'success');
            } catch (joinErr: any) {
                const joinStatus = joinErr?.response?.status;
                if (joinStatus === 409) {
                    // Already joined — just sync state
                    setEvents(prev =>
                        prev.map(ev =>
                            ev.eid === modalEvent.eid
                                ? { ...ev, team_member: true, already_joined: true }
                                : ev
                        )
                    );
                } else {
                    // Publisher joined but event join failed — refresh to get correct state
                    showToast('Joined publisher. Please click Join again to register for the event.', 'success');
                    loadEvents();
                }
            } finally {
                setLoadingEid(null);
            }

        } catch (err: any) {
            const status = err?.response?.status;
            if (status === 409) {
                // Already a publisher member — close modal and try joining event
                setModalEvent(null);
                showToast('You are already a member of this publisher. Joining the event…', 'success');
                setLoadingEid(modalEvent.eid);
                try {
                    await joinActiveEvent(modalEvent.eid, modalEvent.pid);
                    setEvents(prev =>
                        prev.map(ev =>
                            ev.eid === modalEvent.eid
                                ? { ...ev, team_member: true, already_joined: true }
                                : ev
                        )
                    );
                    showToast(`Successfully joined "${modalEvent.name}"!`, 'success');
                } catch {
                    loadEvents();
                } finally {
                    setLoadingEid(null);
                }
            } else {
                const msg = err?.response?.data?.message ?? 'Failed to send publisher join request.';
                showToast(msg, 'error');
            }
        } finally {
            setJoiningPublisher(false);
        }
    };
    const onJoinTeam = (pid: string) => {
        (async () => {
            try {
                const requesttojoin = await requestJoinPublisher(pid)
                console.log("requesttojoin", requesttojoin)
                showToast("Request to join sent successfully", 'success')
                const data = await fetchActiveEvents();
                setEvents(data);
            } catch (err: any) {
                const status = err?.response?.status;
                if (status === 409) {

                    showToast(err?.response?.data?.message, 'error');
                } else {
                    const msg = err?.response?.data?.message ?? 'Failed to join event.';
                    showToast(msg, 'error');
                }
            }
        })()
    }
    // ── Render: Loading ───────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="bg-white dark:bg-card border border-border rounded-xl shadow-sm p-8 flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
                <span className="text-sm font-medium">Loading events…</span>
            </div>
        );
    }

    // ── Render: Error ─────────────────────────────────────────────────────────
    if (fetchError) {
        return (
            <div className="bg-white dark:bg-card border border-border rounded-xl shadow-sm p-8 flex flex-col items-center gap-3 text-center">
                <CalendarDays className="w-10 h-10 text-muted-foreground/40" />
                <p className="text-sm font-medium text-red-500">{fetchError}</p>
                <Button size="sm" variant="outline" onClick={loadEvents} className="gap-2">
                    <RefreshCw className="w-4 h-4" /> Retry
                </Button>
            </div>
        );
    }

    // ── Render: Empty ─────────────────────────────────────────────────────────
    if (events.length === 0) {
        return (
            <div className="bg-white dark:bg-card border border-border rounded-xl shadow-sm p-8 flex flex-col items-center gap-3 text-center text-muted-foreground">
                <CalendarDays className="w-10 h-10 text-muted-foreground/40" />
                <p className="text-sm font-medium">No active events at the moment.</p>
                <Button size="sm" variant="outline" onClick={loadEvents} className="gap-2">
                    <RefreshCw className="w-4 h-4" /> Refresh
                </Button>
            </div>
        );
    }

    // ── Render: Events list ───────────────────────────────────────────────────
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

            {/* Join Publisher Modal — shown only when team_member === false */}
            {modalEvent && (
                <JoinPublisherModal
                    eventName={modalEvent.name}
                    onJoin={handleJoinPublisher}
                    onClose={() => setModalEvent(null)}
                    joining={joiningPublisher}
                />
            )}

            {/* Events list card */}
            <div className="bg-white dark:bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                    <h2 className="text-base font-bold text-foreground">Active Events</h2>
                    <button
                        onClick={loadEvents}
                        disabled={loading}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-accent/50"
                        title="Refresh events"
                    >
                        <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
                    </button>
                </div>

                <div className="flex flex-col">
                    {events.map((event, index) => (
                        <EventCard
                            key={event.eid}
                            event={event}
                            isLast={index === events.length - 1}
                            loadingEid={loadingEid}
                            onJoin={handleJoin}
                            onJoinTeam={onJoinTeam}
                        />
                    ))}
                </div>

                <button
                    className="w-full p-3 text-sm font-bold text-muted-foreground hover:bg-accent/50 transition-colors border-t border-border/50"
                    onClick={loadEvents}
                >
                    Show more
                </button>
            </div>
        </>
    );
}
