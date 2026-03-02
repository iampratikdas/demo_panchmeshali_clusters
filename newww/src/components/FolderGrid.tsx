import { useAtom } from 'jotai';
import { workspaceFoldersAtom, currentFolderAtom } from '../store/atoms';
import { Folder, MoreVertical, FolderOpen, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface FolderGridProps {
    onRename?: (folderId: string) => void;
    onDelete?: (folderId: string) => void;
}

export function FolderGrid({ onRename, onDelete }: FolderGridProps) {
    const [folders] = useAtom(workspaceFoldersAtom);
    const [currentFolder, setCurrentFolder] = useAtom(currentFolderAtom);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const currentFolders = folders.filter((f) => f.parentId === currentFolder);

    if (currentFolders.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {currentFolders.map((folder, index) => (
                <motion.div
                    key={folder.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative flex items-center p-3 h-12 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer select-none transition-colors"
                    onDoubleClick={() => setCurrentFolder(folder.id)}
                >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Folder className="h-5 w-5 flex-shrink-0 text-gray-700 fill-gray-700" />
                        <span className="text-sm font-medium text-gray-700 truncate">
                            {folder.name}
                        </span>
                    </div>

                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenu(activeMenu === folder.id ? null : folder.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded-full transition-all"
                        >
                            <MoreVertical className="h-4 w-4 text-gray-500" />
                        </button>

                        {activeMenu === folder.id && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenu(null);
                                    }}
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute right-0 top-8 z-20 bg-white rounded-lg shadow-xl border border-gray-100 py-1 min-w-[140px]"
                                >
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentFolder(folder.id);
                                            setActiveMenu(null);
                                        }}
                                        className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                                    >
                                        <FolderOpen className="h-4 w-4" />
                                        Open
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRename?.(folder.id);
                                            setActiveMenu(null);
                                        }}
                                        className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                        Rename
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete?.(folder.id);
                                            setActiveMenu(null);
                                        }}
                                        className="w-full px-4 py-2 text-sm text-left hover:bg-red-50 text-red-600 flex items-center gap-2"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                    </button>
                                </motion.div>
                            </>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
