import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import type { Content, ContentStatus } from '../types/content';
import { mapStatusToBackend } from '../lib/contentMapper';

interface ContentMarkModalProps {
    open: boolean;
    content: Content | null;
    initialMarks?: number;
    onClose: () => void;
    onSubmit: (payload: { marks: number; status: string }) => void;
    isLoading?: boolean;
}

const STATUS_OPTIONS: { value: ContentStatus; label: string }[] = [
    { value: 'Under Review', label: 'Under Review' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Submitted', label: 'Submitted' },
    { value: 'Rejected', label: 'Rejected' },
];

export function ContentMarkModal({
    open,
    content,
    initialMarks = 0,
    onClose,
    onSubmit,
    isLoading = false,
}: ContentMarkModalProps) {
    const [marks, setMarks] = useState(initialMarks);
    const [status, setStatus] = useState<ContentStatus>(content?.status ?? 'Under Review');

    useEffect(() => {
        if (open && content) {
            setMarks(initialMarks);
            setStatus(content.status);
        }
    }, [open, content, initialMarks]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ marks, status: mapStatusToBackend(status) });
    };

    return (
        <AnimatePresence>
            {open && content && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md px-4"
                    >
                        <div className="bg-white border border-border/60 rounded-2xl shadow-2xl overflow-hidden">
                            <div className="px-6 py-5 bg-gradient-to-r from-amber-50 via-orange-50/80 to-yellow-50 border-b border-amber-100/60">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md">
                                                <Star className="h-4 w-4 fill-white text-white" />
                                            </span>
                                            Give Marks
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 pl-10">
                                            {content.title}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="h-8 w-8 rounded-xl flex items-center justify-center hover:bg-white/80 transition-colors border border-transparent hover:border-border/50"
                                    >
                                        <X className="h-4 w-4 text-muted-foreground" />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4 p-6">
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">
                                        Marks (0–10)
                                    </label>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={10}
                                        step={0.5}
                                        value={marks}
                                        onChange={(e) => setMarks(Number(e.target.value))}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">
                                        Status
                                    </label>
                                    <Select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value as ContentStatus)}
                                        options={STATUS_OPTIONS.map((o) => ({
                                            value: o.value,
                                            label: o.label,
                                        }))}
                                    />
                                </div>

                                <div className="flex gap-3 justify-end pt-2">
                                    <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-md"
                                    >
                                        {isLoading ? 'Saving…' : 'Submit Marks'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
