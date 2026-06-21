import { useState } from 'react';
import type { Content } from '../types/content';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchProofreadContents,
    proofreadAI,
    saveProofreadContent,
    markProofreadDone,
} from '../lib/api';
import { htmlToPlain } from '../lib/htmlUtils';
import {
    SpellCheck2, ChevronRight, BookOpen, RefreshCw,
    Search, Calendar, ChevronLeft, X, Save, Sparkles, PenLine,
    ClipboardCheck, CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { useToast } from '../hooks/useToast';

type ProofreadMode = 'manual' | 'ai';

const PAGE_SIZE = 5;

const DATE_FILTERS = [
    { label: 'All Time', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
];

export default function ProofReadRoom() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const [mode, setMode] = useState<ProofreadMode>('manual');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('all');
    const [pickerPage, setPickerPage] = useState(1);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedContent, setSelectedContent] = useState<Content | null>(null);
    const [pickerOpen, setPickerOpen] = useState(true);

    const [inputText, setInputText] = useState('');
    const [aiPreview, setAiPreview] = useState('');
    const [aiSummary, setAiSummary] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [hasAiResult, setHasAiResult] = useState(false);
    const [isPrDone, setIsPrDone] = useState(false);

    const { data: contentsData, isLoading: listLoading } = useQuery({
        queryKey: ['proofread-contents', pickerPage, searchQuery, dateFilter],
        queryFn: () => fetchProofreadContents(pickerPage, PAGE_SIZE, searchQuery, dateFilter),
    });

    const pageItems = contentsData?.data ?? [];
    const totalPages = contentsData?.totalPages ?? 1;
    const totalCount = contentsData?.total ?? 0;

    const saveMutation = useMutation({
        mutationFn: () => {
            const text = mode === 'ai' && hasAiResult ? aiPreview : inputText;
            return saveProofreadContent(selectedId!, text, mode);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['proofread-contents'] });
            toast({
                title: 'Saved',
                description: 'Proofread content has been updated.',
            });
        },
        onError: (err: Error) => {
            toast({
                title: 'Save failed',
                description: err.message,
                variant: 'destructive',
            });
        },
    });

    const markDoneMutation = useMutation({
        mutationFn: () => {
            const text = mode === 'ai' && hasAiResult ? aiPreview : inputText;
            return markProofreadDone(selectedId!, text, mode);
        },
        onSuccess: () => {
            setIsPrDone(true);
            queryClient.invalidateQueries({ queryKey: ['proofread-contents'] });
            queryClient.invalidateQueries({ queryKey: ['publish-preview-events'] });
            toast({
                title: 'Proof read done',
                description: 'Content is marked ready for book publish preview.',
            });
        },
        onError: (err: Error) => {
            toast({
                title: 'Could not mark as done',
                description: err.message,
                variant: 'destructive',
            });
        },
    });

    const handleSearch = (v: string) => {
        setSearchQuery(v);
        setPickerPage(1);
    };

    const handleDate = (v: string) => {
        setDateFilter(v);
        setPickerPage(1);
    };

    const handleLoad = (c: Content) => {
        setInputText(htmlToPlain(c.content || ''));
        setSelectedId(c.id);
        setSelectedContent(c);
        setIsPrDone(!!c.pr);
        setAiPreview('');
        setAiSummary('');
        setHasAiResult(false);
        setPickerOpen(false);
    };

    const handleRunAI = async () => {
        if (!selectedId || !inputText.trim()) return;
        setIsChecking(true);
        setHasAiResult(false);
        try {
            const result = await proofreadAI(selectedId, inputText);
            setAiPreview(result.correctedText);
            setAiSummary(result.summary);
            setHasAiResult(true);
        } catch (err) {
            toast({
                title: 'AI proofread failed',
                description: err instanceof Error ? err.message : 'Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsChecking(false);
        }
    };

    const handleModeChange = (next: ProofreadMode) => {
        setMode(next);
        setAiPreview('');
        setAiSummary('');
        setHasAiResult(false);
    };

    const canSave = !!selectedId && (
        mode === 'manual'
            ? inputText.trim().length > 0
            : hasAiResult && aiPreview.trim().length > 0
    );

    return (
        <div className="space-y-4 sm:space-y-5 pb-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
            >
                <div className="flex items-start gap-3">
                    <div className="p-2.5 sm:p-3 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-xl shrink-0 shadow-sm">
                        <SpellCheck2 className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Proof Read Room</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Approved submissions only — edit manually or use AI.
                        </p>
                    </div>
                </div>

                {/* AI / Manual toggle */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 border border-gray-200 self-start">
                    <button
                        type="button"
                        onClick={() => handleModeChange('manual')}
                        className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                            mode === 'manual'
                                ? 'bg-white text-indigo-700 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <PenLine className="h-3.5 w-3.5" />
                        Manual
                    </button>
                    <button
                        type="button"
                        onClick={() => handleModeChange('ai')}
                        className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                            mode === 'ai'
                                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                        AI
                    </button>
                </div>
            </motion.div>

            {/* Main grid */}
            <div className={`grid grid-cols-1 gap-4 sm:gap-6 ${
                mode === 'ai' ? 'lg:grid-cols-12' : 'lg:grid-cols-12'
            }`}>

                {/* ── Picker column ── */}
                <div className={`space-y-3 ${mode === 'ai' ? 'lg:col-span-4' : 'lg:col-span-4'}`}>
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                            Approved Writings
                        </h2>
                        <button
                            type="button"
                            onClick={() => setPickerOpen((o) => !o)}
                            className="lg:hidden text-xs text-indigo-600 font-semibold px-2 py-1 rounded-lg hover:bg-indigo-50"
                        >
                            {pickerOpen ? 'Hide ▲' : 'Browse ▼'}
                        </button>
                    </div>

                    <div className={`${pickerOpen ? 'block' : 'hidden lg:block'} space-y-3`}>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Title or author…"
                                className="w-full pl-8 pr-8 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-shadow"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => handleSearch('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-700"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            {DATE_FILTERS.map((f) => (
                                <button
                                    key={f.value}
                                    type="button"
                                    onClick={() => handleDate(f.value)}
                                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-full transition-colors ${
                                        dateFilter === f.value
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        <p className="text-[11px] text-muted-foreground">
                            {totalCount} approved {totalCount === 1 ? 'writing' : 'writings'}
                        </p>

                        <div className="glass-card rounded-xl divide-y overflow-hidden min-h-[120px]">
                            {listLoading && (
                                <div className="flex items-center justify-center py-10">
                                    <RefreshCw className="h-5 w-5 animate-spin text-indigo-400" />
                                </div>
                            )}
                            {!listLoading && pageItems.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground text-center px-4">
                                    <BookOpen className="h-7 w-7 mb-2 opacity-20" />
                                    <p className="text-sm">No approved content found</p>
                                </div>
                            )}
                            {!listLoading && pageItems.map((c) => (
                                <motion.button
                                    key={c.id}
                                    type="button"
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleLoad(c)}
                                    className={`w-full text-left px-3 sm:px-4 py-3 flex items-start gap-3 hover:bg-indigo-50 transition-colors ${
                                        selectedId === c.id ? 'bg-indigo-50 border-l-2 border-indigo-500' : ''
                                    }`}
                                >
                                    <BookOpen className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium leading-tight truncate">{c.title}</p>
                                        <p className="text-xs text-muted-foreground capitalize mt-0.5">{c.type}</p>
                                        {c.pr && (
                                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded-full mt-0.5">
                                                <CheckCircle2 className="h-2.5 w-2.5" /> PR Done
                                            </span>
                                        )}
                                        {c.authorName && (
                                            <p className="text-[10px] text-indigo-500 mt-0.5 truncate">by {c.authorName}</p>
                                        )}
                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                            {new Date(c.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric', month: 'short', year: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                                </motion.button>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-1">
                                <button
                                    type="button"
                                    onClick={() => setPickerPage((p) => Math.max(1, p - 1))}
                                    disabled={pickerPage === 1}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <span className="text-xs text-muted-foreground">
                                    Page {pickerPage} of {totalPages}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setPickerPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={pickerPage === totalPages}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Editor column ── */}
                <div className={`space-y-3 ${mode === 'ai' ? 'lg:col-span-4' : 'lg:col-span-8'}`}>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                            {mode === 'manual' ? 'Edit Content' : 'Source Content'}
                        </h2>
                        {selectedContent && (
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    Approved
                                </span>
                                {isPrDone && (
                                    <span className="text-[10px] font-medium text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-200 flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" /> Proof Read Done
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {!selectedId ? (
                        <div className="flex flex-col items-center justify-center h-52 sm:h-64 rounded-2xl border-2 border-dashed border-gray-200 text-muted-foreground text-center px-4">
                            <BookOpen className="h-10 w-10 mb-3 opacity-20" />
                            <p className="text-sm font-medium">Select an approved writing</p>
                            <p className="text-xs mt-1">Choose from the list to start proofreading</p>
                        </div>
                    ) : (
                        <>
                            <textarea
                                value={inputText}
                                onChange={(e) => {
                                    setInputText(e.target.value);
                                    if (mode === 'ai') setHasAiResult(false);
                                }}
                                placeholder="Content will appear here…"
                                className="w-full h-52 sm:h-64 lg:h-80 p-4 rounded-xl border border-gray-200 bg-white text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-shadow"
                            />

                            {mode === 'ai' && (
                                <Button
                                    onClick={handleRunAI}
                                    disabled={!inputText.trim() || isChecking}
                                    className="w-full gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
                                >
                                    {isChecking ? (
                                        <><RefreshCw className="h-4 w-4 animate-spin" /> Proofreading…</>
                                    ) : (
                                        <><Sparkles className="h-4 w-4" /> Run AI Proofreader</>
                                    )}
                                </Button>
                            )}

                            {mode === 'manual' && (
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Button
                                        onClick={() => saveMutation.mutate()}
                                        disabled={!canSave || saveMutation.isPending}
                                        variant="outline"
                                        className="flex-1 gap-2"
                                    >
                                        {saveMutation.isPending ? (
                                            <><RefreshCw className="h-4 w-4 animate-spin" /> Saving…</>
                                        ) : (
                                            <><Save className="h-4 w-4" /> Save Changes</>
                                        )}
                                    </Button>
                                    <Button
                                        onClick={() => markDoneMutation.mutate()}
                                        disabled={!canSave || markDoneMutation.isPending || isPrDone}
                                        className="flex-1 gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
                                    >
                                        {markDoneMutation.isPending ? (
                                            <><RefreshCw className="h-4 w-4 animate-spin" /> Marking…</>
                                        ) : isPrDone ? (
                                            <><CheckCircle2 className="h-4 w-4" /> Proof Read Done</>
                                        ) : (
                                            <><ClipboardCheck className="h-4 w-4" /> Proof Read Done</>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* ── AI Preview column (AI mode only) ── */}
                <AnimatePresence mode="wait">
                    {mode === 'ai' && (
                        <motion.div
                            key="ai-preview"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="lg:col-span-4 space-y-3"
                        >
                            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                <ClipboardCheck className="h-3.5 w-3.5 text-violet-500" />
                                AI Preview
                            </h2>

                            {!hasAiResult && !isChecking && (
                                <div className="flex flex-col items-center justify-center h-52 sm:h-64 rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/30 text-muted-foreground text-center px-4">
                                    <Sparkles className="h-10 w-10 mb-3 text-violet-300" />
                                    <p className="text-sm">Run AI proofreader to see preview</p>
                                </div>
                            )}

                            {isChecking && (
                                <div className="rounded-2xl border bg-white p-5 space-y-3 h-52 sm:h-64">
                                    {[80, 65, 90, 55, 75].map((w, i) => (
                                        <div
                                            key={i}
                                            className="h-3 rounded-full bg-gradient-to-r from-indigo-100 to-violet-100 animate-pulse"
                                            style={{ width: `${w}%`, animationDelay: `${i * 0.1}s` }}
                                        />
                                    ))}
                                    <p className="text-xs text-center text-muted-foreground pt-4">AI is proofreading…</p>
                                </div>
                            )}

                            {hasAiResult && !isChecking && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-3"
                                >
                                    {aiSummary && (
                                        <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200/60 text-xs text-emerald-800">
                                            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                                            {aiSummary}
                                        </div>
                                    )}
                                    <div className="rounded-2xl border border-violet-200/60 bg-gradient-to-br from-white to-violet-50/40 p-4 sm:p-5 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap min-h-[200px] max-h-80 overflow-y-auto">
                                        {aiPreview}
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Button
                                            onClick={() => saveMutation.mutate()}
                                            disabled={!canSave || saveMutation.isPending}
                                            variant="outline"
                                            className="flex-1 gap-2"
                                        >
                                            {saveMutation.isPending ? (
                                                <><RefreshCw className="h-4 w-4 animate-spin" /> Saving…</>
                                            ) : (
                                                <><Save className="h-4 w-4" /> Save Draft</>
                                            )}
                                        </Button>
                                        <Button
                                            onClick={() => markDoneMutation.mutate()}
                                            disabled={!canSave || markDoneMutation.isPending || isPrDone}
                                            className="flex-1 gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
                                        >
                                            {markDoneMutation.isPending ? (
                                                <><RefreshCw className="h-4 w-4 animate-spin" /> Marking…</>
                                            ) : isPrDone ? (
                                                <><CheckCircle2 className="h-4 w-4" /> Proof Read Done</>
                                            ) : (
                                                <><ClipboardCheck className="h-4 w-4" /> Proof Read Done</>
                                            )}
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
