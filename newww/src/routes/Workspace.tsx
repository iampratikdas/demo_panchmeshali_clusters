import { useState, useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import {
    workspaceFoldersAtom,
    currentFolderAtom
} from '../store/atoms';
import { FolderTree } from '../components/FolderTree';
import { StorageBar } from '../components/StorageBar';
import { CreateFolderModal } from '../components/CreateFolderModal';
import { RenameFolderModal } from '../components/RenameFolderModal';
import { ShareModal } from '../components/ShareModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import {
    FolderPlus,
    ChevronDown,
    ChevronRight,
    Search,
    Upload,
    RefreshCw,
    AlertCircle,
    FileText,
    Download,
    Trash2,
    MoreVertical,
    BadgeDollarSign,
    Loader2,
} from 'lucide-react';
import { FolderGrid } from '../components/FolderGrid';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import type { EmailTheme } from '../types/workspace';
import { motion, AnimatePresence } from 'framer-motion';
import {
    useAllFolders,
    useCreateFolder,
    useRenameFolder,
    useDeleteFolder,
} from '../hooks/useFolders';
import {
    useWorkspaceFiles,
    useUploadWorkspaceFile,
    useDeleteWorkspaceFile,
} from '../hooks/useWorkspaceFiles';

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function formatDate(ts: string): string {
    const d = new Date(Number(ts) * 1000);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const EXT_COLORS: Record<string, string> = {
    pdf: 'text-red-500',
    docx: 'text-blue-500',
};

export default function Workspace() {
    // ── State ─────────────────────────────────────────────────────────────────
    const [folders, setFolders] = useAtom(workspaceFoldersAtom);
    const [currentFolder, setCurrentFolder] = useAtom(currentFolderAtom);

    const [searchQuery, setSearchQuery] = useState('');
    const [apiError, setApiError] = useState<string | null>(null);
    const [payAlert, setPayAlert] = useState(false); // "You have to pay" modal
    const [fileMenuOpen, setFileMenuOpen] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Modals ────────────────────────────────────────────────────────────────
    const [createFolderModal, setCreateFolderModal] = useState<{ isOpen: boolean; parentId: string }>({ isOpen: false, parentId: 'root' });
    const [renameModal, setRenameModal] = useState<{ isOpen: boolean; folderId: string; folderName: string }>({ isOpen: false, folderId: '', folderName: '' });
    const [shareModal, setShareModal] = useState<{ isOpen: boolean; file: null }>({ isOpen: false, file: null });
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; type: 'folder' | 'file'; id: string; name: string }>({ isOpen: false, type: 'file', id: '', name: '' });

    // ── API Hooks ─────────────────────────────────────────────────────────────
    const { data: apiFolders, isLoading: foldersLoading, isError: foldersError, refetch: refetchFolders } = useAllFolders();
    const createFolderMutation = useCreateFolder();
    const renameFolderMutation = useRenameFolder();
    const deleteFolderMutation = useDeleteFolder();

    const { data: apiFiles = [], isLoading: filesLoading, refetch: refetchFiles } = useWorkspaceFiles(currentFolder);
    const uploadFileMutation = useUploadWorkspaceFile();
    const deleteFileMutation = useDeleteWorkspaceFile(currentFolder);

    // Sync API folders → jotai so FolderTree / FolderGrid work unchanged
    useEffect(() => {
        if (apiFolders && apiFolders.length > 0) setFolders(apiFolders);
    }, [apiFolders, setFolders]);

    // Refetch files whenever current folder changes
    useEffect(() => { refetchFiles(); }, [currentFolder]);

    // ── Filtered files ────────────────────────────────────────────────────────
    const filteredFiles = searchQuery.trim()
        ? apiFiles.filter(f => f.original_name.toLowerCase().includes(searchQuery.toLowerCase()))
        : apiFiles;

    // ── Breadcrumbs ───────────────────────────────────────────────────────────
    const getBreadcrumbs = () => {
        const bc: typeof folders = [];
        let id: string | null = currentFolder;
        while (id && id !== 'root') {
            const folder = folders.find(f => f.id === id);
            if (folder) { bc.unshift(folder); id = folder.parentId; }
            else break;
        }
        return bc;
    };
    const breadcrumbs = getBreadcrumbs();

    // ── Folder handlers ───────────────────────────────────────────────────────
    const handleCreateFolder = async (folderName: string) => {
        setApiError(null);
        try {
            await createFolderMutation.mutateAsync({ name: folderName, parentId: createFolderModal.parentId });
        } catch (err: any) { setApiError(err?.message ?? 'Failed to create folder'); }
    };

    const handleRenameFolder = (folderId: string) => {
        const folder = folders.find(f => f.id === folderId);
        if (!folder) return;
        setRenameModal({ isOpen: true, folderId, folderName: folder.name });
    };

    const confirmRenameFolder = async (newName: string) => {
        if (!newName?.trim()) return;
        setApiError(null);
        try {
            await renameFolderMutation.mutateAsync({ folder_id: renameModal.folderId, name: newName.trim() });
        } catch (err: any) { setApiError(err?.message ?? 'Failed to rename folder'); }
    };

    const handleDeleteFolder = async (folderId: string) => {
        setApiError(null);
        try {
            await deleteFolderMutation.mutateAsync(folderId);
            if (currentFolder === folderId) setCurrentFolder('root');
        } catch (err: any) { setApiError(err?.message ?? 'Failed to delete folder'); }
    };

    // ── File upload handler ───────────────────────────────────────────────────
    const handleUploadClick = () => fileInputRef.current?.click();

    const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Client-side type guard
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext !== 'pdf' && ext !== 'docx') {
            setApiError('Only PDF and DOCX files are allowed.');
            e.target.value = '';
            return;
        }

        setApiError(null);
        try {
            const result = await uploadFileMutation.mutateAsync({ file, folder_id: currentFolder });
            if (result.overQuota) {
                setPayAlert(true); // Show "You have to pay" dialog
            }
        } catch (err: any) {
            setApiError(err?.message ?? 'Upload failed');
        } finally {
            // Reset file input so same file can be re-selected
            e.target.value = '';
        }
    };

    // ── File delete handler ───────────────────────────────────────────────────
    const handleDeleteFile = async (file_id: string, name: string) => {
        setDeleteModal({ isOpen: true, type: 'file', id: file_id, name });
    };

    const confirmDelete = async () => {
        setApiError(null);
        try {
            if (deleteModal.type === 'file') {
                await deleteFileMutation.mutateAsync(deleteModal.id);
            } else {
                await handleDeleteFolder(deleteModal.id);
            }
        } catch (err: any) {
            setApiError(err?.message ?? 'Delete failed');
        }
    };

    return (
        <div className="space-y-6">
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={handleFileSelected}
            />

            {/* ── Header ────────────────────────────────────────────────── */}
            <div className="flex flex-col gap-4 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={() => setCurrentFolder('root')}
                            className="text-2xl text-gray-700 hover:text-gray-900 transition-colors"
                        >
                            My Drive
                        </button>
                        {breadcrumbs.length > 0 && (
                            <>
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                                {breadcrumbs.map((folder, index) => (
                                    <div key={folder.id} className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentFolder(folder.id)}
                                            className={`text-2xl transition-colors ${index === breadcrumbs.length - 1 ? 'text-gray-900 font-semibold' : 'text-gray-600 hover:text-gray-800'}`}
                                        >
                                            {folder.name}
                                        </button>
                                        {index < breadcrumbs.length - 1 && <ChevronRight className="h-5 w-5 text-gray-400" />}
                                    </div>
                                ))}
                            </>
                        )}
                        {breadcrumbs.length === 0 && <ChevronDown className="h-5 w-5 text-gray-500" />}
                    </div>

                    {/* Search + actions */}
                    <div className="flex items-center gap-3 flex-1 justify-end">
                        <div className="relative max-w-md w-full hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search files…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-gray-50 border-transparent focus:bg-white transition-colors"
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setApiError(null); refetchFolders(); refetchFiles(); }}
                            className="shadow-sm"
                            disabled={foldersLoading}
                            title="Refresh"
                        >
                            <RefreshCw className={`h-4 w-4 ${foldersLoading ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button
                            onClick={handleUploadClick}
                            className="flex items-center gap-2 shadow-sm"
                            disabled={uploadFileMutation.isPending}
                        >
                            {uploadFileMutation.isPending
                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                : <Upload className="h-4 w-4" />}
                            <span className="hidden sm:inline">Upload</span>
                        </Button>
                    </div>
                </div>

                {/* Filter chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {['Type', 'People', 'Modified', 'Source'].map((chip) => (
                        <div key={chip} className="flex items-center gap-2 bg-white rounded-full border px-3 py-1.5 shadow-sm hover:bg-gray-50 cursor-pointer transition-colors whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-700">{chip}</span>
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                        </div>
                    ))}
                    {/* Upload hint */}
                    <div className="ml-auto text-xs text-gray-400 whitespace-nowrap pr-1">
                        PDF &amp; DOCX only · 10 MB limit
                    </div>
                </div>

                {/* API error banner */}
                <AnimatePresence>
                    {(apiError || foldersError) && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm"
                        >
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{apiError ?? 'Failed to load folders.'}</span>
                            <button onClick={() => setApiError(null)} className="ml-auto text-red-500 hover:text-red-700 font-bold">×</button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── "You have to pay" quota alert modal ──────────────────────── */}
            <AnimatePresence>
                {payAlert && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                        onClick={() => setPayAlert(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.85, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.85, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 20 }}
                            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-center mb-4">
                                <div className="p-4 rounded-full bg-amber-100">
                                    <BadgeDollarSign className="h-10 w-10 text-amber-500" />
                                </div>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Storage Limit Reached</h2>
                            <p className="text-gray-600 mb-2 text-sm leading-relaxed">
                                You have used your free <span className="font-semibold">10 MB</span> workspace quota.
                            </p>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
                                <p className="text-amber-800 font-semibold text-sm">
                                    💳 You have to pay to continue uploading files.
                                </p>
                            </div>
                            <div className="flex gap-3 justify-center">
                                <Button variant="outline" onClick={() => setPayAlert(false)}>
                                    Close
                                </Button>
                                <Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={() => setPayAlert(false)}>
                                    Upgrade Storage
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Main Content ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Sidebar */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="hidden lg:block lg:col-span-3">
                    <div className="glass-card rounded-xl p-4 sticky top-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold">Folders</h2>
                            <Button
                                size="sm"
                                onClick={() => setCreateFolderModal({ isOpen: true, parentId: currentFolder })}
                                className="h-8 w-8 p-0"
                                disabled={createFolderMutation.isPending}
                            >
                                <FolderPlus className="h-4 w-4" />
                            </Button>
                        </div>
                        {foldersLoading ? (
                            <div className="flex items-center justify-center py-6 text-gray-400 text-sm gap-2">
                                <RefreshCw className="h-4 w-4 animate-spin" /> Loading…
                            </div>
                        ) : (
                            <FolderTree
                                onCreateFolder={(parentId) => setCreateFolderModal({ isOpen: true, parentId })}
                                onRenameFolder={handleRenameFolder}
                                onDeleteFolder={(folderId) => {
                                    const folder = folders.find(f => f.id === folderId);
                                    if (folder) setDeleteModal({ isOpen: true, type: 'folder', id: folderId, name: folder.name });
                                }}
                            />
                        )}
                        <div className="mt-4 pt-4 border-t">
                            <StorageBar />
                        </div>
                    </div>
                </motion.div>

                {/* Main area */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-9 space-y-6">

                    {/* Folders */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-medium text-gray-600">Folders</h2>
                        </div>
                        {foldersLoading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <FolderGrid
                                onRename={handleRenameFolder}
                                onDelete={(folderId) => {
                                    const folder = folders.find(f => f.id === folderId);
                                    if (folder) setDeleteModal({ isOpen: true, type: 'folder', id: folderId, name: folder.name });
                                }}
                            />
                        )}
                    </div>

                    {/* Files */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-medium text-gray-600">Files</h2>
                            <button
                                onClick={handleUploadClick}
                                disabled={uploadFileMutation.isPending}
                                className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors disabled:opacity-50"
                            >
                                {uploadFileMutation.isPending
                                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    : <Upload className="h-3.5 w-3.5" />}
                                Upload PDF / DOCX
                            </button>
                        </div>

                        {filesLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : filteredFiles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground border-2 border-dashed border-gray-200 rounded-xl">
                                <FileText className="h-12 w-12 mb-3 opacity-20" />
                                <p className="font-medium">No files in this folder</p>
                                <p className="text-sm mt-1">Upload a PDF or DOCX to get started</p>
                                <button
                                    onClick={handleUploadClick}
                                    className="mt-3 flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                                >
                                    <Upload className="h-4 w-4" /> Upload file
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredFiles.map((file, index) => (
                                    <motion.div
                                        key={file.file_id}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.04 }}
                                        className="glass-card rounded-xl p-4 hover:shadow-lg transition-all group relative"
                                    >
                                        {/* Icon + menu */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className={`p-3 rounded-lg bg-gray-100 ${EXT_COLORS[file.ext] ?? 'text-gray-500'}`}>
                                                <FileText className="h-6 w-6" />
                                            </div>

                                            <div className="relative">
                                                <button
                                                    onClick={() => setFileMenuOpen(fileMenuOpen === file.file_id ? null : file.file_id)}
                                                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    <MoreVertical className="h-4 w-4 text-gray-500" />
                                                </button>

                                                {fileMenuOpen === file.file_id && (
                                                    <>
                                                        <div className="fixed inset-0 z-10" onClick={() => setFileMenuOpen(null)} />
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            className="absolute right-0 top-8 z-20 bg-white rounded-lg shadow-xl border border-gray-100 py-1 min-w-[140px]"
                                                        >
                                                            <a
                                                                href={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${file.file_path}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="w-full px-3 py-2 text-sm text-left hover:bg-primary/10 flex items-center gap-2 transition-colors text-gray-900"
                                                                onClick={() => setFileMenuOpen(null)}
                                                            >
                                                                <Download className="h-4 w-4" /> Download
                                                            </a>
                                                            <button
                                                                onClick={() => { handleDeleteFile(file.file_id, file.original_name); setFileMenuOpen(null); }}
                                                                className="w-full px-3 py-2 text-sm text-left hover:bg-red-50 text-red-600 flex items-center gap-2 transition-colors"
                                                            >
                                                                <Trash2 className="h-4 w-4" /> Delete
                                                            </button>
                                                        </motion.div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div>
                                            <h3 className="font-semibold text-sm mb-1 truncate" title={file.original_name}>
                                                {file.original_name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span className="uppercase font-semibold px-1.5 py-0.5 rounded bg-gray-100">
                                                    {file.ext}
                                                </span>
                                                <span>·</span>
                                                <span>{formatBytes(file.size_bytes)}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">{formatDate(file.createdAt)}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Mobile StorageBar */}
                    <div className="lg:hidden mt-8 pt-6 border-t">
                        <StorageBar />
                    </div>
                </motion.div>
            </div>

            {/* ── Modals ───────────────────────────────────────────────────── */}
            <CreateFolderModal
                isOpen={createFolderModal.isOpen}
                onClose={() => setCreateFolderModal({ isOpen: false, parentId: 'root' })}
                onConfirm={handleCreateFolder}
            />

            <RenameFolderModal
                isOpen={renameModal.isOpen}
                onClose={() => setRenameModal({ isOpen: false, folderId: '', folderName: '' })}
                onConfirm={confirmRenameFolder}
                currentName={renameModal.folderName}
            />

            <ShareModal
                isOpen={shareModal.isOpen}
                file={shareModal.file}
                onClose={() => setShareModal({ isOpen: false, file: null })}
                onShare={(_emails: string[], _theme: EmailTheme, _msg: string) => {}}
            />

            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                itemName={deleteModal.name}
                onClose={() => setDeleteModal({ isOpen: false, type: 'file', id: '', name: '' })}
                onConfirm={() => { confirmDelete(); setDeleteModal({ isOpen: false, type: 'file', id: '', name: '' }); }}
                title={`Delete ${deleteModal.type === 'folder' ? 'Folder' : 'File'}`}
                message={`Are you sure you want to delete this ${deleteModal.type}? This action cannot be undone.`}
            />
        </div>
    );
}
