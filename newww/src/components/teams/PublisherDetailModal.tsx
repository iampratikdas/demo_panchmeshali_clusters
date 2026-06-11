import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeftToLine, Star, Users, Calendar, Mail, Phone, Building, FileText, LogOut, MessageSquare } from 'lucide-react';
import { Button } from '../../ui/button';

interface PublisherDetailModalProps {
    publisher: any | null;
    assignmentStatus?: string;
    open: boolean;
    onClose: () => void;
    onLeave?: () => void;
    onChat?: () => void;
    isActionLoading?: boolean;
}

// ─── Star Rating ─────────────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(i => (
                <Star
                    key={i}
                    className={`h-4 w-4 ${i <= Math.round(rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-muted-foreground/25'}`}
                />
            ))}
            <span className="ml-2 text-sm font-bold text-foreground">{(rating ?? 0).toFixed(1)}</span>
            <span className="text-xs text-muted-foreground ml-0.5">/ 5.0</span>
        </div>
    );
}

// ─── Info Row ────────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value?: string | null }) {
    if (!value) return null;
    return (
        <div className="flex items-center gap-3 py-3 border-b border-border/30 last:border-b-0">
            <div className="h-8 w-8 rounded-lg bg-primary/8 border border-border/40 flex items-center justify-center flex-shrink-0">
                <Icon className="h-3.5 w-3.5 text-primary/70" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{label}</p>
                <p className="text-sm font-medium text-foreground mt-0.5 truncate">{value}</p>
            </div>
        </div>
    );
}

// ─── Request Status Badge ────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; border: string }> = {
    Accepted: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', dot: 'bg-emerald-500', border: 'border-emerald-500/25' },
    Pending: { bg: 'bg-amber-500/10', text: 'text-amber-500', dot: 'bg-amber-500', border: 'border-amber-500/25' },
    Rejected: { bg: 'bg-red-500/10', text: 'text-red-500', dot: 'bg-red-500', border: 'border-red-500/25' },
};

function RequestStatusBadge({ status }: { status?: string }) {
    const s = status ?? 'Pending';
    const cfg = STATUS_STYLES[s] ?? STATUS_STYLES.Pending;
    return (
        <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            <span className={`h-2 w-2 rounded-full ${cfg.dot} ${s === 'Pending' ? 'animate-pulse' : ''}`} />
            {s}
        </span>
    );
}

// ─── Main Modal ──────────────────────────────────────────────────────────────
export function PublisherDetailModal({
    publisher, assignmentStatus, open, onClose, onLeave, onChat, isActionLoading,
}: PublisherDetailModalProps) {
    if (!publisher) return null;

    const joinedDate = publisher.createdAt
        ? new Date(Number(publisher.createdAt) * 1000).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
        })
        : null;

    const memberCount = Array.isArray(publisher.uids) ? publisher.uids.length : 0;
    const isActive = publisher.status === 'Active';

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* ── Backdrop ── */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] h-full "
                    />

                    {/* ── Panel: bottom-sheet on mobile, right-panel on md+ ── */}
                    <motion.div
                        key="panel"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 340, damping: 34 }}
                        className={[
                            'fixed z-[91] bg-white flex flex-col overflow-hidden',
                            // Mobile: bottom sheet
                            'bottom-0 left-0 right-0 max-h-[92dvh] rounded-t-3xl border-t border-border/40',
                            // Desktop: right panel, full height, no rounded top
                            'md:bottom-auto md:top-0 md:left-auto md:right-0 md:max-h-screen md:h-screen md:w-full md:max-w-md md:rounded-none md:border-t-0 md:border-l',
                        ].join(' ')}
                    >
                        {/* Drag handle – mobile only */}
                        <div className="md:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
                            <div className="h-1 w-12 rounded-full bg-muted-foreground/20" />
                        </div>

                        {/* ── Sticky Header ── */}
                        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-border/40">
                            <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-primary" />
                                <h2 className="text-base font-bold text-foreground">Publisher Profile</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="h-8 w-8 cursor-pointer bg-red-100 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                            >
                                <ArrowLeftToLine className="h-4 w-4 text-muted-foreground" />
                            </button>
                        </div>

                        {/* ── Scrollable Content ── */}
                        <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

                            {/* ── Hero section ── */}
                            <div className="relative">
                                {/* Gradient banner */}
                                <div
                                    className="h-28 w-full relative overflow-hidden"
                                    style={{ background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)' }}
                                >
                                    {/* Subtle dot pattern */}
                                    <div
                                        className="absolute inset-0"
                                        style={{
                                            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
                                            backgroundSize: '20px 20px',
                                        }}
                                    />
                                    {/* Glow circles */}
                                    <div className="absolute -top-8 -right-8 h-36 w-36 rounded-full bg-white/10 blur-3xl" />
                                    <div className="absolute top-4 left-8 h-16 w-16 rounded-full bg-white/5 blur-2xl" />
                                </div>

                                {/* Avatar bubble – centered below the banner */}
                                <div className="flex flex-col items-center relative z-10" style={{ marginTop: '-36px' }}>
                                    <div className="h-[72px] w-[72px] rounded-2xl bg-white border-[3px] border-background shadow-2xl flex items-center justify-center overflow-hidden">
                                        {publisher.logo_url ? (
                                            <img
                                                src={publisher.logo_url}
                                                alt={publisher.name}
                                                className="h-full w-full object-cover bg-white "
                                                onError={e => { e.currentTarget.style.display = 'none'; }}
                                            />
                                        ) : (
                                            <Building className="h-8 w-8 text-primary" />
                                        )}
                                    </div>

                                    {/* Name */}
                                    <h3 className="mt-3 text-xl font-bold text-foreground text-center px-4 leading-tight">
                                        {publisher.name}
                                    </h3>

                                    {/* Publisher account status badge */}
                                    <span className={`mt-2 mb-5 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border
                                        ${isActive
                                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25'
                                            : 'bg-amber-500/10 text-amber-500 border-amber-500/25'}`}
                                    >
                                        <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                        {publisher.status || 'Active'}
                                    </span>
                                </div>
                            </div>

                            {/* ── Body ── */}
                            <div className="px-5 space-y-4 pb-8">

                                {/* Description */}
                                {publisher.description && publisher.description !== 'description' && (
                                    <p className="text-sm text-muted-foreground leading-relaxed text-center">
                                        {publisher.description}
                                    </p>
                                )}

                                {/* Stats: Members + Rating */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex flex-col items-center justify-center gap-1 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/15">
                                        <div className="flex items-center gap-1.5">
                                            <Users className="h-4 w-4 text-blue-500" />
                                            <span className="text-2xl font-bold text-blue-500">{memberCount}</span>
                                        </div>
                                        <span className="text-[11px] text-muted-foreground font-medium">Team Members</span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center gap-1 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15">
                                        <div className="flex items-center gap-1.5">
                                            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                                            <span className="text-2xl font-bold text-amber-500">
                                                {(publisher.average_rating ?? 0).toFixed(1)}
                                            </span>
                                        </div>
                                        <span className="text-[11px] text-muted-foreground font-medium">Avg Rating</span>
                                    </div>
                                </div>

                                {/* Request status row */}
                                <div className="flex items-center justify-between bg-muted/40 rounded-2xl px-4 py-3.5 border border-border/30">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Your Membership</p>
                                        <p className="text-sm font-semibold text-foreground mt-0.5">Request Status</p>
                                    </div>
                                    <RequestStatusBadge status={assignmentStatus} />
                                </div>

                                {/* Star rating */}
                                <div className="flex items-center justify-between bg-gradient-to-r from-amber-500/5 to-orange-500/5 rounded-2xl px-4 py-3.5 border border-amber-500/10">
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Publisher Rating</p>
                                    <StarRating rating={publisher.average_rating || 0} />
                                </div>

                                {/* Divider */}
                                <div className="flex items-center gap-3 py-1">
                                    <div className="flex-1 h-px bg-border/40" />
                                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Contact & Details</span>
                                    <div className="flex-1 h-px bg-border/40" />
                                </div>

                                {/* Contact info card */}
                                <div className="rounded-2xl border border-border/40 bg-card px-4">
                                    <InfoRow icon={Mail} label="Email" value={publisher.email} />
                                    <InfoRow icon={Phone} label="Phone" value={publisher.phone} />
                                    <InfoRow icon={FileText} label="Registration ID" value={publisher.rgst_gov_id} />
                                    <InfoRow icon={Calendar} label="Registered Since" value={joinedDate} />
                                </div>

                                {/* Chat button — only when Accepted */}
                                {assignmentStatus === 'Accepted' && onChat && (
                                    <Button
                                        onClick={onChat}
                                        variant="outline"
                                        className="w-full h-11 rounded-xl gap-2 font-semibold border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50"
                                    >
                                        <MessageSquare className="h-4 w-4" />
                                        Chat
                                    </Button>
                                )}

                                {/* Leave button */}
                                {onLeave && (
                                    <Button
                                        onClick={onLeave}
                                        disabled={isActionLoading}
                                        variant="outline"
                                        className="w-full h-11 rounded-xl border-red-500/25 text-red-500 hover:bg-red-500/8 hover:border-red-500/40 gap-2 font-semibold"
                                    >
                                        {isActionLoading
                                            ? <span className="h-4 w-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                                            : <LogOut className="h-4 w-4" />
                                        }
                                        Leave This Publisher
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
