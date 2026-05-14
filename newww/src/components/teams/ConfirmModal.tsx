import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '../../ui/button';

interface ConfirmModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmLabel?: string;
    isLoading?: boolean;
    variant?: 'danger' | 'warning';
}

export function ConfirmModal({
    open, onClose, onConfirm, title, description,
    confirmLabel = 'Confirm', isLoading = false, variant = 'danger'
}: ConfirmModalProps) {
    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 10 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md"
                    >
                        <div className="bg-card border border-border rounded-2xl shadow-2xl p-6">
                            <div className="flex items-start gap-4">
                                <div className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center ${variant === 'danger' ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
                                    <AlertTriangle className={`h-6 w-6 ${variant === 'danger' ? 'text-red-500' : 'text-amber-500'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-semibold text-foreground">{title}</h3>
                                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{description}</p>
                                </div>
                                <button onClick={onClose} className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                                    <X className="h-4 w-4 text-muted-foreground" />
                                </button>
                            </div>
                            <div className="flex gap-3 mt-6 justify-end">
                                <Button variant="outline" onClick={onClose} disabled={isLoading} className="min-w-[90px]">
                                    Cancel
                                </Button>
                                <Button
                                    onClick={onConfirm}
                                    disabled={isLoading}
                                    className={`min-w-[90px] ${variant === 'danger' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-amber-500 hover:bg-amber-600 text-white'}`}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Processing...
                                        </span>
                                    ) : confirmLabel}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
