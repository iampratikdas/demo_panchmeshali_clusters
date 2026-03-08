import { motion, AnimatePresence } from 'framer-motion';
import {
    X, BookOpen, FileText, Layers, ChevronDown, ChevronUp,
    Pencil, Check, RotateCcw
} from 'lucide-react';
import type { WorkspaceFile } from '../types/workspace';
import { cn } from '../lib/utils';
import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { workspaceFilesAtom } from '../store/atoms';
import { RichTextEditor } from './RichTextEditor';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface ContentPreviewModalProps {
    file: WorkspaceFile | null;
    isOpen: boolean;
    onClose: () => void;
}

const statusColors: Record<string, string> = {
    Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Approved: 'bg-green-100 text-green-700 border-green-200',
    Rejected: 'bg-red-100 text-red-700 border-red-200',
    Reviewing: 'bg-blue-100 text-blue-700 border-blue-200',
};

const typeIconBg: Record<string, string> = {
    story: 'bg-purple-50 text-purple-600',
    poem: 'bg-pink-50 text-pink-600',
};

const STATUS_OPTIONS = ['Pending', 'Reviewing', 'Approved', 'Rejected'];
const TYPE_OPTIONS = ['story', 'poem', 'doc', 'txt', 'pdf'];

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
    });
}

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(2)} MB`;
}

/* ── Small reusable label ── */
function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            {children}
        </p>
    );
}

export function ContentPreviewModal({ file, isOpen, onClose }: ContentPreviewModalProps) {
    const [, setFiles] = useAtom(workspaceFilesAtom);

    const [editMode, setEditMode] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);

    // Editable draft state
    const [draft, setDraft] = useState<Partial<WorkspaceFile>>({});

    // Re-seed draft whenever file changes or modal opens
    useEffect(() => {
        if (file) setDraft({ ...file });
        setEditMode(false);
        setDetailsOpen(false);
    }, [file?.id, isOpen]);

    if (!file) return null;

    const isContent = file.type === 'story' || file.type === 'poem';

    // ── Helpers ──────────────────────────────────────────
    const setField = <K extends keyof WorkspaceFile>(key: K, val: WorkspaceFile[K]) =>
        setDraft(prev => ({ ...prev, [key]: val }));

    const handleSave = () => {
        setFiles(prev =>
            prev.map(f =>
                f.id === file.id
                    ? {
                        ...f,
                        ...draft,
                        modifiedAt: new Date().toISOString(),
                        // recompute excerpt from fullContent
                        excerpt: draft.fullContent
                            ? draft.fullContent.replace(/<[^>]+>/g, '').slice(0, 120) + '…'
                            : f.excerpt,
                    }
                    : f
            )
        );
        setEditMode(false);
    };

    const handleCancel = () => {
        setDraft({ ...file });
        setEditMode(false);
    };

    // ── View helpers ─────────────────────────────────────
    const d = editMode ? draft : file; // show draft in edit, file in view

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        onClick={editMode ? undefined : onClose} // prevent accidental close in edit mode
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={cn(
                            "bg-white w-full sm:max-w-2xl lg:max-w-3xl flex flex-col overflow-hidden",
                            "h-full sm:h-auto sm:max-h-[92vh]",
                            "rounded-t-2xl sm:rounded-2xl shadow-2xl"
                        )}>

                            {/* Mobile drag handle */}
                            <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
                                <div className="w-10 h-1 rounded-full bg-gray-300" />
                            </div>

                            {/* ── Header ── */}
                            <div className={cn(
                                'flex items-start gap-3 px-4 py-4 sm:px-6 sm:py-5 border-b shrink-0',
                                isContent
                                    ? 'bg-gradient-to-r from-purple-50 via-white to-pink-50'
                                    : 'bg-gray-50'
                            )}>
                                <div className={cn(
                                    'p-2.5 sm:p-3 rounded-xl shrink-0',
                                    typeIconBg[d.type ?? ''] || 'bg-gray-100 text-gray-600'
                                )}>
                                    {isContent
                                        ? <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
                                        : <FileText className="h-5 w-5 sm:h-6 sm:w-6" />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    {/* Badges row */}
                                    <div className="flex items-center gap-1 flex-wrap mb-1">
                                        {d.contentType && (
                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 uppercase tracking-wide whitespace-nowrap">
                                                {d.contentType}
                                            </span>
                                        )}
                                        {d.status && (
                                            <span className={cn(
                                                'text-[9px] font-bold px-1.5 py-0.5 rounded-full border uppercase tracking-wide whitespace-nowrap',
                                                statusColors[d.status] || 'bg-gray-100 text-gray-600'
                                            )}>
                                                {d.status}
                                            </span>
                                        )}
                                        {editMode && (
                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 uppercase tracking-wide animate-pulse whitespace-nowrap">
                                                Editing
                                            </span>
                                        )}
                                    </div>

                                    {/* Title — editable in edit mode */}
                                    {editMode ? (
                                        <Input
                                            value={draft.name ?? ''}
                                            onChange={e => setField('name', e.target.value)}
                                            className="text-base font-bold h-8 px-2 mb-1 w-full"
                                            placeholder="Title"
                                        />
                                    ) : (
                                        <h2 className="text-sm sm:text-xl font-bold text-gray-900 leading-tight">
                                            {d.name}
                                        </h2>
                                    )}

                                    {/* Author */}
                                    {!editMode && d.author && (
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            by <span className="font-medium text-gray-700">{d.author}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Action buttons — desktop only in header */}
                                <div className="hidden sm:flex items-center gap-1 shrink-0">
                                    {!editMode ? (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setEditMode(true)}
                                            className="h-8 gap-1.5 text-xs"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                            Edit
                                        </Button>
                                    ) : (
                                        <>
                                            <Button size="sm" variant="ghost" onClick={handleCancel} className="h-8 gap-1 text-xs text-gray-500">
                                                <RotateCcw className="h-3.5 w-3.5" />
                                                Cancel
                                            </Button>
                                            <Button size="sm" onClick={handleSave} className="h-8 gap-1.5 text-xs bg-purple-600 hover:bg-purple-700">
                                                <Check className="h-3.5 w-3.5" />
                                                Save
                                            </Button>
                                        </>
                                    )}
                                    <button
                                        onClick={editMode ? handleCancel : onClose}
                                        className="p-2 hover:bg-white/80 rounded-xl transition-colors ml-1"
                                        aria-label="Close"
                                    >
                                        <X className="h-5 w-5 text-gray-500" />
                                    </button>
                                </div>

                                {/* Mobile: just close button in header */}
                                <button
                                    onClick={editMode ? handleCancel : onClose}
                                    className="sm:hidden p-2 hover:bg-white/80 rounded-xl transition-colors shrink-0"
                                    aria-label="Close"
                                >
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Mobile edit action bar — visible only in edit mode */}
                            {editMode && (
                                <div className="sm:hidden flex items-center gap-2 px-4 py-2.5 border-b bg-orange-50/60 shrink-0">
                                    <button
                                        onClick={handleCancel}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 bg-white active:bg-gray-100 transition-colors"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-purple-600 text-sm font-semibold text-white active:bg-purple-700 transition-colors"
                                    >
                                        <Check className="h-4 w-4" />
                                        Save changes
                                    </button>
                                </div>
                            )}
                            <div className="flex-1 overflow-y-auto">

                                {/* Content Area */}
                                <div className="px-4 py-5 sm:px-6">
                                    {editMode ? (
                                        /* Rich Text Editor in edit mode */
                                        <RichTextEditor
                                            content={draft.fullContent ?? ''}
                                            onChange={(html) => setField('fullContent', html)}
                                            placeholder="Write your content here…"
                                        />
                                    ) : (
                                        /* Read-only rendered HTML */
                                        d.fullContent ? (
                                            <div
                                                className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                                                dangerouslySetInnerHTML={{ __html: d.fullContent }}
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                                                <FileText className="h-8 w-8 mb-2 opacity-20" />
                                                <p className="text-sm">No content preview available</p>
                                            </div>
                                        )
                                    )}
                                </div>

                                {/* ── Details / Edit Fields ── */}
                                <div className="px-4 sm:px-6 pb-4">

                                    {/* Mobile collapse toggle */}
                                    {!editMode && (
                                        <button
                                            onClick={() => setDetailsOpen(o => !o)}
                                            className="sm:hidden w-full flex items-center justify-between py-2.5 border-t border-b text-sm font-semibold text-gray-600 mb-3"
                                        >
                                            <span className="flex items-center gap-2">
                                                <Layers className="h-4 w-4 text-gray-400" />
                                                Details
                                            </span>
                                            {detailsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </button>
                                    )}

                                    {/* Details / Edit form */}
                                    <div className={cn(
                                        editMode
                                            ? 'block border-t pt-5'
                                            : cn('sm:block mt-0 sm:mt-3', detailsOpen ? 'block' : 'hidden sm:block')
                                    )}>
                                        {editMode ? (
                                            /* ─── Edit form ─── */
                                            <div className="space-y-4">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Edit Details</p>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {/* Author */}
                                                    <div>
                                                        <FieldLabel>Author</FieldLabel>
                                                        <Input
                                                            value={draft.author ?? ''}
                                                            onChange={e => setField('author', e.target.value)}
                                                            placeholder="Author name"
                                                        />
                                                    </div>

                                                    {/* Category */}
                                                    <div>
                                                        <FieldLabel>Category</FieldLabel>
                                                        <Input
                                                            value={draft.category ?? ''}
                                                            onChange={e => setField('category', e.target.value)}
                                                            placeholder="e.g. Fantasy, Romance…"
                                                        />
                                                    </div>

                                                    {/* Publisher */}
                                                    <div>
                                                        <FieldLabel>Publisher</FieldLabel>
                                                        <Input
                                                            value={draft.publisher ?? ''}
                                                            onChange={e => setField('publisher', e.target.value)}
                                                            placeholder="Publisher name"
                                                        />
                                                    </div>

                                                    {/* Event name */}
                                                    <div>
                                                        <FieldLabel>Event</FieldLabel>
                                                        <Input
                                                            value={draft.eventName ?? ''}
                                                            onChange={e => setField('eventName', e.target.value)}
                                                            placeholder="Event name (if applicable)"
                                                        />
                                                    </div>

                                                    {/* Type */}
                                                    <div>
                                                        <FieldLabel>Type</FieldLabel>
                                                        <select
                                                            value={draft.type ?? 'story'}
                                                            onChange={e => setField('type', e.target.value as WorkspaceFile['type'])}
                                                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                                                        >
                                                            {TYPE_OPTIONS.map(t => (
                                                                <option key={t} value={t}>
                                                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Status */}
                                                    <div>
                                                        <FieldLabel>Status</FieldLabel>
                                                        <select
                                                            value={draft.status ?? 'Pending'}
                                                            onChange={e => setField('status', e.target.value)}
                                                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                                                        >
                                                            {STATUS_OPTIONS.map(s => (
                                                                <option key={s} value={s}>{s}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Mobile save/cancel bar */}
                                                <div className="sm:hidden flex gap-2 pt-2">
                                                    <Button variant="outline" className="flex-1" onClick={handleCancel}>
                                                        Cancel
                                                    </Button>
                                                    <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={handleSave}>
                                                        <Check className="h-4 w-4 mr-1" />
                                                        Save Changes
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* ─── View grid ─── */
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl">
                                                {[
                                                    { label: 'Type', value: file.type.charAt(0).toUpperCase() + file.type.slice(1) },
                                                    { label: 'Category', value: file.category },
                                                    { label: 'Publisher', value: file.publisher },
                                                    { label: 'Author', value: file.author },
                                                    { label: 'Event', value: file.eventName },
                                                    { label: 'Submitted', value: formatDate(file.createdAt) },
                                                    { label: 'Updated', value: formatDate(file.modifiedAt) },
                                                    { label: 'Size', value: formatBytes(file.size) },
                                                ].filter(i => i.value).map(({ label, value }) => (
                                                    <div key={label} className="min-w-0">
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                                                        <p className="text-sm font-semibold text-gray-800 truncate" title={value}>{value}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ── Footer ── */}
                            <div className="border-t px-4 sm:px-6 py-3 flex items-center justify-between bg-gray-50/40 shrink-0">
                                {/* Mobile edit button (not shown in edit mode) */}
                                {!editMode && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setEditMode(true)}
                                        className="sm:hidden gap-1.5 text-xs"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                        Edit
                                    </Button>
                                )}
                                <div className="flex-1" />
                                <button
                                    onClick={editMode ? handleCancel : onClose}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                                >
                                    {editMode ? 'Discard' : 'Close'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
