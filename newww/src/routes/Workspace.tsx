import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import {
    workspaceFoldersAtom,
    workspaceFilesAtom,
    currentFolderAtom
} from '../store/atoms';
import { FolderTree } from '../components/FolderTree';
import { FileGrid } from '../components/FileGrid';
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
} from 'lucide-react';
import { FolderGrid } from '../components/FolderGrid';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import type { EmailTheme, WorkspaceFile } from '../types/workspace';
import { motion } from 'framer-motion';
import {
    useAllFolders,
    useCreateFolder,
    useRenameFolder,
    useDeleteFolder,
} from '../hooks/useFolders';

export default function Workspace() {
    // ── Jotai atoms (synced from API) ─────────────────────────────────────────
    const [folders, setFolders] = useAtom(workspaceFoldersAtom);
    const [files, setFiles] = useAtom(workspaceFilesAtom);
    const [currentFolder, setCurrentFolder] = useAtom(currentFolderAtom);

    // ── API hooks ─────────────────────────────────────────────────────────────
    const { data: apiFolders, isLoading: foldersLoading, isError: foldersError, refetch } = useAllFolders();
    const createFolderMutation = useCreateFolder();
    const renameFolderMutation = useRenameFolder();
    const deleteFolderMutation = useDeleteFolder();

    // Sync API folders → jotai atom so FolderTree / FolderGrid keep working
    useEffect(() => {
        if (apiFolders && apiFolders.length > 0) {
            setFolders(apiFolders);
        }
    }, [apiFolders, setFolders]);

    // ── Modal states ──────────────────────────────────────────────────────────
    const [createFolderModal, setCreateFolderModal] = useState<{ isOpen: boolean; parentId: string }>({
        isOpen: false,
        parentId: 'root'
    });
    const [renameModal, setRenameModal] = useState<{ isOpen: boolean; folderId: string; folderName: string }>({
        isOpen: false,
        folderId: '',
        folderName: ''
    });
    const [shareModal, setShareModal] = useState<{ isOpen: boolean; file: WorkspaceFile | null }>({
        isOpen: false,
        file: null
    });
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        type: 'folder' | 'file';
        id: string;
        name: string;
    }>({
        isOpen: false,
        type: 'file',
        id: '',
        name: ''
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [apiError, setApiError] = useState<string | null>(null);

    // ── Breadcrumb navigation ─────────────────────────────────────────────────
    const getBreadcrumbs = () => {
        const breadcrumbs = [];
        let folderId: string | null = currentFolder;

        while (folderId && folderId !== 'root') {
            const folder = folders.find(f => f.id === folderId);
            if (folder) {
                breadcrumbs.unshift(folder);
                folderId = folder.parentId;
            } else {
                break;
            }
        }

        return breadcrumbs;
    };

    const breadcrumbs = getBreadcrumbs();

    // ── Folder operations (wired to real API) ─────────────────────────────────

    const handleCreateFolder = async (folderName: string) => {
        setApiError(null);
        try {
            await createFolderMutation.mutateAsync({
                name: folderName,
                parentId: createFolderModal.parentId,
            });
        } catch (err: any) {
            setApiError(err?.message ?? 'Failed to create folder');
        }
    };

    const handleRenameFolder = (folderId: string) => {
        const folder = folders.find(f => f.id === folderId);
        if (!folder) return;

        setRenameModal({
            isOpen: true,
            folderId: folderId,
            folderName: folder.name
        });
    };

    const confirmRenameFolder = async (newName: string) => {
        if (!newName || !newName.trim()) return;
        setApiError(null);
        try {
            await renameFolderMutation.mutateAsync({
                folder_id: renameModal.folderId,
                name: newName.trim(),
            });
        } catch (err: any) {
            setApiError(err?.message ?? 'Failed to rename folder');
        }
    };

    const handleDeleteFolder = async (folderId: string) => {
        // Check if folder has children in local state
        const hasChildren = folders.some(f => f.parentId === folderId) ||
            files.some(f => f.folderId === folderId);

        if (hasChildren) {
            setApiError('Cannot delete folder with contents. Please remove all files and sub-folders first.');
            return;
        }

        setApiError(null);
        try {
            await deleteFolderMutation.mutateAsync(folderId);
            if (currentFolder === folderId) {
                setCurrentFolder('root');
            }
        } catch (err: any) {
            setApiError(err?.message ?? 'Failed to delete folder');
        }
    };

    // ── File operations (unchanged — files still use local state) ─────────────

    const handleUploadFile = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.doc,.docx,.txt';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const newFile: WorkspaceFile = {
                    id: `file-${Date.now()}`,
                    name: file.name,
                    folderId: currentFolder,
                    type: file.name.split('.').pop() as any || 'txt',
                    size: file.size,
                    createdAt: new Date().toISOString(),
                    modifiedAt: new Date().toISOString(),
                };
                setFiles([...files, newFile]);
            }
        };
        input.click();
    };

    const handleDownloadFile = (fileId: string) => {
        const file = files.find(f => f.id === fileId);
        if (file) {
            alert(`Downloading: ${file.name}\n(In production, this would trigger an actual download)`);
        }
    };

    const handleShareFile = (fileId: string) => {
        const file = files.find(f => f.id === fileId);
        if (file) {
            setShareModal({ isOpen: true, file });
        }
    };

    const handleShareConfirm = (emails: string[], theme: EmailTheme, message: string) => {
        alert(`File shared via ${theme} theme to:\n${emails.join(', ')}\n\nMessage: ${message || '(none)'}`);
    };

    const handleDeleteFile = (fileId: string) => {
        const file = files.find(f => f.id === fileId);
        if (file) {
            setDeleteModal({
                isOpen: true,
                type: 'file',
                id: fileId,
                name: file.name
            });
        }
    };

    const confirmDelete = async () => {
        if (deleteModal.type === 'file') {
            setFiles(files.filter(f => f.id !== deleteModal.id));
        } else {
            await handleDeleteFolder(deleteModal.id);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                                            className={`text-2xl transition-colors ${index === breadcrumbs.length - 1
                                                ? 'text-gray-900 font-semibold'
                                                : 'text-gray-600 hover:text-gray-800'
                                                }`}
                                        >
                                            {folder.name}
                                        </button>
                                        {index < breadcrumbs.length - 1 && (
                                            <ChevronRight className="h-5 w-5 text-gray-400" />
                                        )}
                                    </div>
                                ))}
                            </>
                        )}

                        {breadcrumbs.length === 0 && (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                    </div>

                    {/* Search, Refresh, and Upload */}
                    <div className="flex items-center gap-3 flex-1 justify-end">
                        <div className="relative max-w-md w-full hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search in Drive"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-gray-50 border-transparent focus:bg-white transition-colors"
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setApiError(null); refetch(); }}
                            className="flex items-center gap-2 shadow-sm"
                            disabled={foldersLoading}
                            title="Refresh folders"
                        >
                            <RefreshCw className={`h-4 w-4 ${foldersLoading ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button onClick={handleUploadFile} className="flex items-center gap-2 shadow-sm">
                            <Upload className="h-4 w-4" />
                            <span className="hidden sm:inline">New</span>
                        </Button>
                    </div>
                </div>

                {/* Filter chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    <div className="flex items-center gap-2 bg-white rounded-full border px-3 py-1.5 shadow-sm hover:bg-gray-50 cursor-pointer transition-colors whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-700">Type</span>
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-full border px-3 py-1.5 shadow-sm hover:bg-gray-50 cursor-pointer transition-colors whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-700">People</span>
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-full border px-3 py-1.5 shadow-sm hover:bg-gray-50 cursor-pointer transition-colors whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-700">Modified</span>
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-full border px-3 py-1.5 shadow-sm hover:bg-gray-50 cursor-pointer transition-colors whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-700">Source</span>
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                    </div>
                </div>

                {/* API error banner */}
                {(apiError || foldersError) && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm"
                    >
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{apiError ?? 'Failed to load folders from server. Showing cached data.'}</span>
                        <button
                            onClick={() => setApiError(null)}
                            className="ml-auto text-red-500 hover:text-red-700 font-bold"
                        >
                            ×
                        </button>
                    </motion.div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Sidebar - Folder Tree */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="hidden lg:block lg:col-span-3"
                >
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
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                Loading folders…
                            </div>
                        ) : (
                            <FolderTree
                                onCreateFolder={(parentId) => setCreateFolderModal({ isOpen: true, parentId })}
                                onRenameFolder={handleRenameFolder}
                                onDeleteFolder={(folderId) => {
                                    const folder = folders.find(f => f.id === folderId);
                                    if (folder) {
                                        setDeleteModal({
                                            isOpen: true,
                                            type: 'folder',
                                            id: folderId,
                                            name: folder.name
                                        });
                                    }
                                }}
                            />
                        )}
                        <div className="mt-4 pt-4 border-t">
                            <StorageBar />
                        </div>
                    </div>
                </motion.div>

                {/* Main Area - Folders & Files */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-9 space-y-6"
                >
                    {/* Folders Section */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-medium text-gray-600">Name ↑</h2>
                        </div>
                        {foldersLoading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <FolderGrid
                                onRename={handleRenameFolder}
                                onDelete={(folderId) => {
                                    const folder = folders.find(f => f.id === folderId);
                                    if (folder) {
                                        setDeleteModal({
                                            isOpen: true,
                                            type: 'folder',
                                            id: folderId,
                                            name: folder.name
                                        });
                                    }
                                }}
                            />
                        )}
                    </div>

                    {/* Files Section */}
                    <div>
                        <h2 className="text-sm font-medium text-gray-600 mb-3">Files</h2>
                        <FileGrid
                            onDownload={handleDownloadFile}
                            onShare={handleShareFile}
                            onDelete={handleDeleteFile}
                        />
                    </div>

                    {/* Mobile Storage Bar */}
                    <div className="lg:hidden mt-8 pt-6 border-t">
                        <StorageBar />
                    </div>
                </motion.div>
            </div>

            {/* Modals */}
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
                onShare={handleShareConfirm}
            />

            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                itemName={deleteModal.name}
                onClose={() => setDeleteModal({ isOpen: false, type: 'file', id: '', name: '' })}
                onConfirm={() => {
                    confirmDelete();
                    setDeleteModal({ isOpen: false, type: 'file', id: '', name: '' });
                }}
                title={`Delete ${deleteModal.type === 'folder' ? 'Folder' : 'File'}`}
                message={`Are you sure you want to delete this ${deleteModal.type}? This action cannot be undone.`}
            />
        </div>
    );
}
