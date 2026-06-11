import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ArrowRightToLine, Star, Users, BookOpen, Calendar, Activity,
    Tag, Mail, User, BarChart3, Clock, MessageSquare
} from 'lucide-react';
import { Button } from '../../ui/button';
import { TeamStatusBadge } from './TeamStatusBadge';

interface WriterDetailModalProps {
    writer: any | null;
    assignmentStatus?: string;
    open: boolean;
    onClose: () => void;
    onAccept?: () => void;
    onReject?: () => void;
    onRemove?: () => void;
    onChat?: () => void;
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
            <span className="ml-1.5 text-sm font-medium text-muted-foreground">{rating.toFixed(1)}</span>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }: any) {
    return (
        <div className="bg-muted/40 rounded-xl p-4 flex items-center gap-3 border border-4 ">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${color}`}>
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-bold text-foreground">{value}</p>
            </div>
        </div>
    );
}

export function WriterDetailModal({
    writer, assignmentStatus, open, onClose,
    onAccept, onReject, onRemove, onChat, isActionLoading
}: WriterDetailModalProps) {
    if (!writer) return null;

    const initials = writer.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '??';
    const joinedDate = writer.createdAt
        ? new Date(Number(writer.createdAt) * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'Unknown';

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] h-full"
                    />
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed right-0 top-0 bg-white h-screen w-full max-w-lg bg-card border-l border-border shadow-2xl z-[91] overflow-y-auto [scrollbar-width:none]"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-card/95 backdrop-blur-md border-b border-border/50 p-5 flex items-center justify-between z-10">
                            <h2 className="text-lg font-bold text-foreground">Writer Profile</h2>
                            <button
                                onClick={onClose}
                                className="h-9 w-9 cursor-pointer  rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                            >
                                <ArrowRightToLine className="h-5 w-5 text-muted-foreground" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Profile hero */}
                            <div className="flex items-start gap-4">
                                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-500/30 to-indigo-500/30 border border-violet-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {writer.profileImage ? (
                                        <img src={writer.profileImage} alt={writer.full_name} className="h-full w-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                                    ) : (
                                        <span className="text-2xl font-bold text-violet-400">{initials}</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xl font-bold text-foreground truncate">{writer.full_name}</h3>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                                        <Mail className="h-3.5 w-3.5" />{writer.email}
                                    </p>
                                    {writer.bio && (
                                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed italic">"{writer.bio}"</p>
                                    )}
                                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                                        {assignmentStatus && <TeamStatusBadge status={assignmentStatus as any} />}
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full border ${writer.activity_status === 'active'
                                            ? 'bg-green-500/10 text-green-500 border-green-500/30'
                                            : writer.activity_status === 'on_leave'
                                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                                                : 'bg-muted text-muted-foreground border-border'
                                            }`}>
                                            <Activity className="h-3 w-3" />
                                            {writer.activity_status === 'active' ? 'Active' : writer.activity_status === 'on_leave' ? 'On Leave' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Star rating */}
                            <div className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 rounded-xl p-4 border border-amber-500/10">
                                <p className="text-xs text-muted-foreground mb-2 font-medium">Average Rating</p>
                                <StarRating rating={writer.average_rating || 0} />
                            </div>

                            {/* Stats grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <StatCard
                                    icon={BookOpen}
                                    label="Stories Published"
                                    value={writer.stories_count ?? 0}
                                    color="bg-blue-500/10 text-blue-500"
                                />
                                <StatCard
                                    icon={Users}
                                    label="Followers"
                                    value={writer.followers_count ?? 0}
                                    color="bg-purple-500/10 text-purple-500"
                                />
                            </div>

                            {/* Genre specialization */}
                            {writer.genre_specialization?.length > 0 && (
                                <div>
                                    <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                                        <Tag className="h-4 w-4 text-muted-foreground" />
                                        Genre Specialization
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {writer.genre_specialization.map((g: string) => (
                                            <span key={g} className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20">
                                                {g}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Info rows */}
                            <div className="space-y-2">
                                <div className="flex items-center border-4 gap-3 p-3 bg-muted/30 rounded-lg">
                                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Joined Platform</p>
                                        <p className="text-sm font-medium text-foreground">{joinedDate}</p>
                                    </div>
                                </div>
                                {writer.skills && (
                                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border-4">
                                        <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Speciality</p>
                                            <p className="text-sm font-medium text-foreground capitalize">{writer.skills}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action buttons */}
                            {(onAccept || onReject || onRemove) && (
                                <div className="border-t border-border/50 pt-5 space-y-3">
                                    {assignmentStatus === 'Pending' && (
                                        <div className="flex gap-3">
                                            {onAccept && (
                                                <Button
                                                    onClick={onAccept}
                                                    disabled={isActionLoading}
                                                    // variant="destructive"
                                                    className="flex-1 glass"
                                                // className="bg-black flex-1 text-white "
                                                // className={"flex-1 bg-black text-white "}
                                                // style={{ backgroundColor: '#44fe06ff', color: '#FFFFFF' }}
                                                >
                                                    Accept Writer
                                                </Button>
                                            )}
                                            {onReject && (
                                                <Button
                                                    onClick={onReject}
                                                    disabled={isActionLoading}
                                                    variant="outline"
                                                    className="flex-1 border-red text-red-500 hover:bg-red-500/10"
                                                >
                                                    Reject
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                    {assignmentStatus === 'Accepted' && (
                                        <div className="space-y-2">
                                            {onChat && (
                                                <Button
                                                    onClick={onChat}
                                                    variant="outline"
                                                    className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/10"
                                                >
                                                    <MessageSquare className="h-4 w-4" />
                                                    Chat
                                                </Button>
                                            )}
                                            {onRemove && (
                                                <Button
                                                    onClick={onRemove}
                                                    disabled={isActionLoading}
                                                    variant="outline"
                                                    className="w-full border-red-500/30 text-red-500 hover:bg-red-500/10"
                                                >
                                                    Remove from Team
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
