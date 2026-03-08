import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchContents } from '../lib/api';
import {
    SpellCheck2, ChevronRight, CheckCircle2, AlertCircle, Lightbulb,
    RefreshCw, BookOpen, ClipboardCheck, Copy, Search, Calendar, ChevronLeft, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';

/* ── Suggestion helpers ─────────────────────────────────────── */
function getMockSuggestions(text: string) {
    if (!text || text.length < 10) return [];
    return [
        { type: 'grammar', original: 'he go', suggestion: 'he goes', message: 'Subject-verb agreement error.' },
        { type: 'spelling', original: 'recieve', suggestion: 'receive', message: 'Common misspelling.' },
        { type: 'style', original: 'very good', suggestion: 'excellent', message: 'Consider stronger word choice.' },
        { type: 'punctuation', original: 'its', suggestion: "it's", message: 'Apostrophe needed for contraction.' },
    ];
}

type Suggestion = ReturnType<typeof getMockSuggestions>[number];
type Segment = { text: string; highlight: boolean; original?: string };

function buildCorrectedSegments(text: string, suggestions: Suggestion[]): Segment[] {
    if (!suggestions.length) return [{ text, highlight: false }];
    let result: Segment[] = [{ text, highlight: false }];
    for (const s of suggestions) {
        const next: Segment[] = [];
        for (const seg of result) {
            if (seg.highlight) { next.push(seg); continue; }
            const idx = seg.text.indexOf(s.original);
            if (idx === -1) { next.push(seg); continue; }
            if (idx > 0) next.push({ text: seg.text.slice(0, idx), highlight: false });
            next.push({ text: s.suggestion, highlight: true, original: s.original });
            const after = seg.text.slice(idx + s.original.length);
            if (after) next.push({ text: after, highlight: false });
        }
        result = next;
    }
    return result;
}

const typeColors: Record<string, string> = {
    grammar: 'bg-red-50 border-red-200 text-red-700',
    spelling: 'bg-orange-50 border-orange-200 text-orange-700',
    style: 'bg-blue-50 border-blue-200 text-blue-700',
    punctuation: 'bg-yellow-50 border-yellow-200 text-yellow-700',
};
const typeIcons: Record<string, typeof AlertCircle> = {
    grammar: AlertCircle,
    spelling: SpellCheck2,
    style: Lightbulb,
    punctuation: CheckCircle2,
};

const PAGE_SIZE = 3;

const DATE_FILTERS = [
    { label: 'All Time', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
];

function isWithinDateFilter(dateStr: string, filter: string) {
    if (filter === 'all') return true;
    const d = new Date(dateStr);
    const now = new Date();
    if (filter === 'today') return d.toDateString() === now.toDateString();
    if (filter === 'week') { const wa = new Date(now); wa.setDate(now.getDate() - 7); return d >= wa; }
    if (filter === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    return true;
}

/* ── Component ─────────────────────────────────────────────── */
export default function ProofReadRoom() {
    // Picker
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('all');
    const [pickerPage, setPickerPage] = useState(1);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [pickerOpen, setPickerOpen] = useState(true);   // mobile collapse

    // Editor
    const [inputText, setInputText] = useState('');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [corrSegs, setCorrSegs] = useState<Segment[]>([]);
    const [isChecking, setIsChecking] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);
    const [copied, setCopied] = useState(false);

    const { data: contentsData } = useQuery({
        queryKey: ['contents', 1, 50],
        queryFn: () => fetchContents(1, 50),
    });

    const filtered = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        return (contentsData?.data ?? []).filter(c => {
            const matchSearch = !q || c.title.toLowerCase().includes(q) || c.authorName?.toLowerCase().includes(q);
            const matchDate = isWithinDateFilter(c.createdAt, dateFilter);
            return matchSearch && matchDate;
        });
    }, [contentsData, searchQuery, dateFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(pickerPage, totalPages);
    const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const handleSearch = (v: string) => { setSearchQuery(v); setPickerPage(1); };
    const handleDate = (v: string) => { setDateFilter(v); setPickerPage(1); };

    const handleCheck = async () => {
        setIsChecking(true); setHasChecked(false);
        await new Promise(r => setTimeout(r, 1200));
        const s = getMockSuggestions(inputText);
        setSuggestions(s);
        setCorrSegs(buildCorrectedSegments(inputText, s));
        setIsChecking(false); setHasChecked(true);
    };

    const handleLoad = (id: string) => {
        const c = contentsData?.data.find(x => x.id === id);
        if (c) {
            setInputText(c.title + '\n\n' + (c.content || ''));
            setSelectedId(id);
            setSuggestions([]); setCorrSegs([]); setHasChecked(false);
            setPickerOpen(false); // auto-collapse on mobile after selecting
        }
    };

    const plainCorrected = corrSegs.map(s => s.text).join('');
    const handleCopy = () => {
        navigator.clipboard.writeText(plainCorrected).then(() => {
            setCopied(true); setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="space-y-5">

            {/* ── Page header ── */}
            <div className="flex items-start gap-3">
                <div className="p-2.5 sm:p-3 bg-indigo-100 rounded-xl shrink-0">
                    <SpellCheck2 className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                </div>
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Proof Read Room</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Search, filter, and proofread submitted content.
                    </p>
                </div>
            </div>

            {/* ── 3-column grid (stacks on mobile) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">

                {/* ── Col 1: Picker ── */}
                <div className="lg:col-span-3 space-y-3">

                    {/* Header row with mobile toggle */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Load Submission</h2>
                        <button
                            onClick={() => setPickerOpen(o => !o)}
                            className="lg:hidden text-xs text-indigo-600 font-semibold px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
                        >
                            {pickerOpen ? 'Hide ▲' : 'Browse ▼'}
                        </button>
                    </div>

                    {/* Collapsible on mobile */}
                    <div className={`${pickerOpen ? 'block' : 'hidden lg:block'} space-y-3`}>

                        {/* Search input */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => handleSearch(e.target.value)}
                                placeholder="Title or author…"
                                className="w-full pl-8 pr-8 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-shadow"
                            />
                            {searchQuery && (
                                <button onClick={() => handleSearch('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-700"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Date filter pills */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            {DATE_FILTERS.map(f => (
                                <button key={f.value} onClick={() => handleDate(f.value)}
                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors ${dateFilter === f.value
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {/* Result count */}
                        <p className="text-[11px] text-muted-foreground">
                            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                            {searchQuery ? ` for "${searchQuery}"` : ''}
                        </p>

                        {/* List */}
                        <div className="glass-card rounded-xl divide-y overflow-hidden">
                            {pageItems.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-center">
                                    <Search className="h-7 w-7 mb-2 opacity-20" />
                                    <p className="text-sm">No submissions match</p>
                                </div>
                            )}
                            {pageItems.map(c => (
                                <button key={c.id} onClick={() => handleLoad(c.id)}
                                    className={`w-full text-left px-3 sm:px-4 py-3 flex items-start gap-3 hover:bg-indigo-50 transition-colors ${selectedId === c.id ? 'bg-indigo-50 border-l-2 border-indigo-500' : ''
                                        }`}
                                >
                                    <BookOpen className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium leading-tight truncate">{c.title}</p>
                                        <p className="text-xs text-muted-foreground capitalize mt-0.5">{c.type}</p>
                                        {c.authorName && (
                                            <p className="text-[10px] text-indigo-500 mt-0.5 truncate">by {c.authorName}</p>
                                        )}
                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                            {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                                </button>
                            ))}
                        </div>

                        {/* Pagination — always visible */}
                        <div className="flex items-center justify-between pt-1">
                            <button onClick={() => setPickerPage(p => Math.max(1, p - 1))}
                                disabled={safePage === 1}
                                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                                    <button key={pg} onClick={() => setPickerPage(pg)}
                                        className={`w-7 h-7 text-xs font-semibold rounded-md transition-colors ${pg === safePage
                                                ? 'bg-indigo-600 text-white'
                                                : 'text-gray-500 hover:bg-gray-100'
                                            }`}
                                    >
                                        {pg}
                                    </button>
                                ))}
                            </div>

                            <button onClick={() => setPickerPage(p => Math.min(totalPages, p + 1))}
                                disabled={safePage === totalPages}
                                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Col 2: Editor ── */}
                <div className="lg:col-span-5 space-y-3">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Content</h2>
                    <textarea
                        value={inputText}
                        onChange={e => { setInputText(e.target.value); setHasChecked(false); }}
                        placeholder="Paste or type content here to proofread…"
                        className="w-full h-52 sm:h-64 lg:h-80 p-4 rounded-xl border border-gray-200 bg-white text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-shadow"
                    />
                    <Button onClick={handleCheck}
                        disabled={!inputText.trim() || isChecking}
                        className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
                    >
                        {isChecking
                            ? <><RefreshCw className="h-4 w-4 animate-spin" /> Checking…</>
                            : <><SpellCheck2 className="h-4 w-4" /> Run Proofreader</>
                        }
                    </Button>
                </div>

                {/* ── Col 3: Suggestions ── */}
                <div className="lg:col-span-4 space-y-3">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        Suggestions {hasChecked && <span className="ml-1 text-indigo-600">({suggestions.length})</span>}
                    </h2>
                    <AnimatePresence mode="wait">
                        {!hasChecked && !isChecking && (
                            <motion.div key="s-empty"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center h-44 sm:h-60 text-center text-muted-foreground border-2 border-dashed rounded-xl"
                            >
                                <SpellCheck2 className="h-9 w-9 mb-3 opacity-20" />
                                <p className="text-sm">Run the proofreader to see suggestions</p>
                            </motion.div>
                        )}
                        {isChecking && (
                            <motion.div key="s-load"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center h-44 sm:h-60 text-muted-foreground"
                            >
                                <RefreshCw className="h-8 w-8 animate-spin mb-3 text-indigo-400" />
                                <p className="text-sm">Analysing content…</p>
                            </motion.div>
                        )}
                        {hasChecked && !isChecking && (
                            <motion.div key="s-results"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="space-y-3 max-h-72 overflow-y-auto pr-1"
                            >
                                {suggestions.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-40 text-center">
                                        <CheckCircle2 className="h-10 w-10 mb-3 text-green-500" />
                                        <p className="text-sm font-semibold text-green-700">No issues found!</p>
                                        <p className="text-xs text-muted-foreground">Content looks great.</p>
                                    </div>
                                ) : suggestions.map((s, i) => {
                                    const Icon = typeIcons[s.type];
                                    return (
                                        <motion.div key={i}
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.06 }}
                                            className={`p-3 rounded-xl border text-sm ${typeColors[s.type]}`}
                                        >
                                            <div className="flex items-center gap-2 font-semibold mb-1 capitalize">
                                                <Icon className="h-4 w-4" />{s.type}
                                            </div>
                                            <p className="text-xs mb-1.5">{s.message}</p>
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="line-through opacity-60">"{s.original}"</span>
                                                <ChevronRight className="h-3 w-3" />
                                                <span className="font-bold">"{s.suggestion}"</span>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ── Proofread Content (full width) ── */}
            <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <ClipboardCheck className="h-4 w-4 text-green-600" />
                        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Proofread Content</h2>
                        {hasChecked && suggestions.length > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 uppercase tracking-wide">
                                {suggestions.length} correction{suggestions.length !== 1 ? 's' : ''} applied
                            </span>
                        )}
                    </div>
                    {hasChecked && plainCorrected && (
                        <button onClick={handleCopy}
                            className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                            <Copy className="h-3.5 w-3.5" />
                            {copied ? 'Copied!' : 'Copy corrected text'}
                        </button>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {!hasChecked && !isChecking && (
                        <motion.div key="pr-empty"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center h-28 sm:h-36 border-2 border-dashed rounded-2xl text-muted-foreground text-center px-4"
                        >
                            <ClipboardCheck className="h-9 w-9 mb-2 opacity-20" />
                            <p className="text-sm">Proofread content will appear here after running the checker</p>
                        </motion.div>
                    )}
                    {isChecking && (
                        <motion.div key="pr-loading"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="rounded-2xl border bg-white p-5 space-y-3"
                        >
                            {[80, 60, 90, 45, 70].map((w, i) => (
                                <div key={i} className="h-3 rounded-full bg-gray-100 animate-pulse" style={{ width: `${w}%` }} />
                            ))}
                        </motion.div>
                    )}
                    {hasChecked && !isChecking && (
                        <motion.div key="pr-result"
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            className="rounded-2xl border bg-white p-4 sm:p-5 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap min-h-[80px]"
                        >
                            {corrSegs.length === 0
                                ? <span className="text-muted-foreground italic">No content to display.</span>
                                : corrSegs.map((seg, i) =>
                                    seg.highlight ? (
                                        <mark key={i} title={`Was: "${seg.original}"`}
                                            className="bg-green-100 text-green-800 font-semibold underline decoration-green-400 decoration-dotted rounded px-0.5 not-italic"
                                        >
                                            {seg.text}
                                        </mark>
                                    ) : <span key={i}>{seg.text}</span>
                                )
                            }
                            {hasChecked && suggestions.length === 0 && (
                                <div className="flex items-center gap-2 mt-3 text-green-700 text-xs font-medium">
                                    <CheckCircle2 className="h-4 w-4" />
                                    No corrections needed — content is clean!
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
