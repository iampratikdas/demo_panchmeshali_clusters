import { useState } from 'react';
import { useAtom } from 'jotai';
import { workspaceFoldersAtom, currentFolderAtom } from '../store/atoms';
import type { WorkspaceFolder } from '../types/workspace';
import { Folder, FolderOpen, ChevronRight, ChevronDown, Plus, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface FolderTreeProps {
    onCreateFolder?: (parentId: string) => void;
    onRenameFolder?: (folderId: string) => void;
    onDeleteFolder?: (folderId: string) => void;
}

export function FolderTree({ onCreateFolder, onRenameFolder, onDeleteFolder }: FolderTreeProps) {
    const [folders] = useAtom(workspaceFoldersAtom);
    const [currentFolder, setCurrentFolder] = useAtom(currentFolderAtom);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));
    const [contextMenu, setContextMenu] = useState<{ folderId: string; x: number; y: number } | null>(null);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const toggleFolder = (folderId: string) => {
        setExpandedFolders((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(folderId)) {
                newSet.delete(folderId);
            } else {
                newSet.add(folderId);
            }
            return newSet;
        });
    };

    const handleContextMenu = (e: React.MouseEvent, folderId: string) => {
        e.preventDefault();
        setContextMenu({ folderId, x: e.clientX, y: e.clientY });
    };

    const closeContextMenu = () => {
        setContextMenu(null);
    };

    const renderFolder = (folder: WorkspaceFolder, level: number = 0) => {
        const childFolders = folders.filter((f) => f.parentId === folder.id);
        const isExpanded = expandedFolders.has(folder.id);
        const isActive = currentFolder === folder.id;
        const hasChildren = childFolders.length > 0;
        const Icon = isExpanded ? FolderOpen : Folder;

        return (
            <div key={folder.id}>
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all group',
                        'hover:bg-primary/10',
                        isActive && 'bg-primary/20'
                    )}
                    style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
                    onClick={() => setCurrentFolder(folder.id)}
                    onContextMenu={(e) => handleContextMenu(e, folder.id)}
                >
                    {hasChildren && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleFolder(folder.id);
                            }}
                            className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                        >
                            {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-gray-600" />
                            ) : (
                                <ChevronRight className="h-4 w-4 text-gray-600" />
                            )}
                        </button>
                    )}
                    {!hasChildren && <div className="w-5" />}

                    <Icon
                        className="h-5 w-5 flex-shrink-0"
                        style={{ color: folder.color || '#9CA3AF' }}
                    />

                    <span className="text-sm font-medium text-gray-900 truncate flex-1">
                        {folder.name}
                    </span>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onCreateFolder?.(folder.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-primary/20 rounded transition-all"
                            title="New Subfolder"
                        >
                            <Plus className="h-3.5 w-3.5 text-primary" />
                        </button>

                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdown(activeDropdown === folder.id ? null : folder.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                                title="More options"
                            >
                                <MoreVertical className="h-3.5 w-3.5 text-gray-600" />
                            </button>

                            {activeDropdown === folder.id && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setActiveDropdown(null)}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="absolute right-0 top-8 z-20 glass-card rounded-lg shadow-xl py-1 min-w-[140px]"
                                    >
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRenameFolder?.(folder.id);
                                                setActiveDropdown(null);
                                            }}
                                            className="w-full px-3 py-2 text-sm text-left hover:bg-primary/10 flex items-center gap-2 transition-colors text-gray-900"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                            Rename
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteFolder?.(folder.id);
                                                setActiveDropdown(null);
                                            }}
                                            className="w-full px-3 py-2 text-sm text-left hover:bg-red-500/20 text-red-600 flex items-center gap-2 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Delete
                                        </button>
                                    </motion.div>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>

                <AnimatePresence>
                    {isExpanded && hasChildren && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {childFolders.map((child) => renderFolder(child, level + 1))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    const rootFolders = folders.filter((f) => f.parentId === null);

    return (
        <>
            <div className="space-y-1">
                {rootFolders.map((folder) => renderFolder(folder))}
            </div>

            {/* Context Menu (Right-click) */}
            {contextMenu && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={closeContextMenu}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="fixed z-50 glass-card rounded-lg shadow-xl py-1 min-w-[180px]"
                        style={{ left: contextMenu.x, top: contextMenu.y }}
                    >
                        <button
                            onClick={() => {
                                onCreateFolder?.(contextMenu.folderId);
                                closeContextMenu();
                            }}
                            className="w-full px-4 py-2 text-sm text-left hover:bg-primary/10 flex items-center gap-2 transition-colors text-gray-900"
                        >
                            <Plus className="h-4 w-4" />
                            New Subfolder
                        </button>
                        {contextMenu.folderId !== 'root' && (
                            <>
                                <button
                                    onClick={() => {
                                        onRenameFolder?.(contextMenu.folderId);
                                        closeContextMenu();
                                    }}
                                    className="w-full px-4 py-2 text-sm text-left hover:bg-primary/10 flex items-center gap-2 transition-colors text-gray-900"
                                >
                                    <Edit2 className="h-4 w-4" />
                                    Rename
                                </button>
                                <button
                                    onClick={() => {
                                        onDeleteFolder?.(contextMenu.folderId);
                                        closeContextMenu();
                                    }}
                                    className="w-full px-4 py-2 text-sm text-left hover:bg-red-500/20 text-red-600 flex items-center gap-2 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </button>
                            </>
                        )}
                    </motion.div>
                </>
            )}
        </>
    );
}
