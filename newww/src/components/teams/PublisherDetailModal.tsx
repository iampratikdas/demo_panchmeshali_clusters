import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Users, BookOpen, Calendar, Mail, Phone, Building, FileText, Globe } from 'lucide-react';
import { Button } from '../../ui/button';

interface PublisherDetailModalProps {
    publisher: any | null;
    assignmentStatus?: string;
    open: boolean;
    onClose: () => void;
    onLeave?: () => void;
    isActionLoading?: boolean;
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
                <Star
                    key={s}
                    className={`h-4 w-4 ${s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`}
                />
            ))}
            <span className="ml-1.5 text-sm font-medium text-muted-foreground">{(rating ?? 0).toFixed(1)}</span>
        </div>
    );
}

function InfoRow({ icon: Icon, label, value }: any) {
    if (!value) return null;
    return (
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium text-foreground">{value}</p>
            </div>
        </div>
    );
}

function StatPill({ label, value, color }: { label: string; value: any; color: string }) {
    return (
        <div className={`flex flex-col items-center p-4 rounded-xl border ${color}`}>
            <span className="text-2xl font-bold">{value}</span>
            <span className="text-xs text-muted-foreground mt-1 text-center">{label}</span>
        </div>
    );
}

export function PublisherDetailModal({
    publisher, assignmentStatus, open, onClose, onLeave, isActionLoading
}: PublisherDetailModalProps) {
    if (!publisher) return null;

    const joinedDate = publisher.createdAt
        ? new Date(Number(publisher.createdAt) * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'Unknown';

    const memberCount = Array.isArray(publisher.uids) ? publisher.uids.length : 0;

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
                    />
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed right-0 top-0 h-screen w-full max-w-lg bg-card border-l border-border shadow-2xl z-[91] overflow-y-auto [scrollbar-width:none]"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-card/95 backdrop-blur-md border-b border-border/50 p-5 flex items-center justify-between z-10">
                            <h2 className="text-lg font-bold text-foreground">Publisher Profile</h2>
                            <button
                                onClick={onClose}
                                className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                            >
                                <X className="h-5 w-5 text-muted-foreground" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Publisher hero */}
                            <div className="relative">
                                <div className="h-28 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 overflow-hidden">
                                    <div className="absolute inset-0 opacity-10"
                                        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}
                                    />
                                </div>
                                <div className="flex items-end gap-4 px-2 -mt-8">
                                    <div className="h-16 w-16 rounded-xl bg-card border-2 border-border shadow-lg flex items-center justify-center overflow-hidden">
                                        {publisher.logo_url ? (
                                            <img src={publisher.logo_url} alt={publisher.name} className="h-full w-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                                        ) : (
                                            <Building className="h-8 w-8 text-primary" />
                                        )}
                                    </div>
                                    <div className="pb-1 flex-1 min-w-0">
                                        <h3 className="text-xl font-bold text-foreground truncate">{publisher.name}</h3>
                                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full border mt-1 ${publisher.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-amber-500/10 text-amber-500 border-amber-500/30'}`}>
                                            {publisher.status || 'Active'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            {publisher.description && (
                                <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 rounded-xl p-4 border border-border/30">
                                    {publisher.description}
                                </p>
                            )}

                            {/* Stats row */}
                            <div className="grid grid-cols-2 gap-3">
                                <StatPill
                                    label="Team Members"
                                    value={memberCount}
                                    color="bg-blue-500/5 border-blue-500/20 text-blue-500"
                                />
                                <StatPill
                                    label="Your Status"
                                    value={assignmentStatus || 'Active'}
                                    color="bg-emerald-500/5 border-emerald-500/20 text-emerald-500"
                                />
                            </div>

                            {/* Star rating */}
                            <div className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 rounded-xl p-4 border border-amber-500/10">
                                <p className="text-xs text-muted-foreground mb-2 font-medium">Publisher Rating</p>
                                <StarRating rating={publisher.average_rating || 0} />
                            </div>

                            {/* Contact info */}
                            <div className="space-y-2">
                                <InfoRow icon={Mail} label="Email" value={publisher.email} />
                                <InfoRow icon={Phone} label="Phone" value={publisher.phone} />
                                <InfoRow icon={FileText} label="Registration ID" value={publisher.rgst_gov_id} />
                                <InfoRow icon={Calendar} label="Registered Since" value={joinedDate} />
                            </div>

                            {/* Leave Team */}
                            {onLeave && (
                                <div className="border-t border-border/50 pt-5">
                                    <Button
                                        onClick={onLeave}
                                        disabled={isActionLoading}
                                        variant="outline"
                                        className="w-full border-red-500/30 text-red-500 hover:bg-red-500/10"
                                    >
                                        Leave This Publisher
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
