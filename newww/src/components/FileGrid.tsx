import { useAtom } from 'jotai';
import { workspaceFilesAtom, currentFolderAtom } from '../store/atoms';
import type { WorkspaceFile } from '../types/workspace';
import { FileText, Download, Share2, Trash2, MoreVertical } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface FileGridProps {
    onDownload?: (fileId: string) => void;
    onShare?: (fileId: string) => void;
    onDelete?: (fileId: string) => void;
}

export function FileGrid({ onDownload, onShare, onDelete }: FileGridProps) {
    const [files] = useAtom(workspaceFilesAtom);
    const [currentFolder] = useAtom(currentFolderAtom);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const currentFolderFiles = files.filter((f) => f.folderId === currentFolder);

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getFileIcon = () => {
        return FileText;
    };

    const getFileColor = (type: WorkspaceFile['type']) => {
        const colors = {
            pdf: 'text-red-500',
            docx: 'text-blue-500',
            doc: 'text-blue-500',
            txt: 'text-gray-500',
        };
        return colors[type] || 'text-gray-500';
    };

    if (currentFolderFiles.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <FileText className="h-16 w-16 mb-4 opacity-20" />
                <p className="text-lg font-medium">No files in this folder</p>
                <p className="text-sm">Upload files to get started</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentFolderFiles.map((file, index) => {
                const Icon = getFileIcon();
                const colorClass = getFileColor(file.type);

                return (
                    <motion.div
                        key={file.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="glass-card rounded-xl p-4 hover:shadow-lg transition-all group relative"
                    >
                        {/* File Icon */}
                        <div className="flex items-start justify-between mb-3">
                            <div className={cn('p-3 rounded-lg bg-gray-100', colorClass)}>
                                <Icon className="h-6 w-6" />
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => setActiveMenu(activeMenu === file.id ? null : file.id)}
                                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <MoreVertical className="h-4 w-4 text-gray-500" />
                                </button>

                                {activeMenu === file.id && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setActiveMenu(null)}
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="absolute right-0 top-8 z-20 glass-card rounded-lg shadow-xl py-1 min-w-[140px]"
                                        >
                                            <button
                                                onClick={() => {
                                                    onDownload?.(file.id);
                                                    setActiveMenu(null);
                                                }}
                                                className="w-full px-3 py-2 text-sm text-left hover:bg-primary/10 flex items-center gap-2 transition-colors text-gray-900"
                                            >
                                                <Download className="h-4 w-4" />
                                                Download
                                            </button>
                                            <button
                                                onClick={() => {
                                                    onShare?.(file.id);
                                                    setActiveMenu(null);
                                                }}
                                                className="w-full px-3 py-2 text-sm text-left hover:bg-primary/10 flex items-center gap-2 transition-colors text-gray-900"
                                            >
                                                <Share2 className="h-4 w-4" />
                                                Share
                                            </button>
                                            <button
                                                onClick={() => {
                                                    onDelete?.(file.id);
                                                    setActiveMenu(null);
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

                        {/* File Info */}
                        <div className="mb-3">
                            <h3 className="font-semibold text-sm mb-1 truncate" title={file.name}>
                                {file.name}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="uppercase font-medium">{file.type}</span>
                                <span>•</span>
                                <span>{formatBytes(file.size)}</span>
                            </div>
                        </div>

                        {/* File Meta */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{formatDate(file.modifiedAt)}</span>
                            {file.sharedWith && file.sharedWith.length > 0 && (
                                <div className="flex items-center gap-1 text-primary">
                                    <Share2 className="h-3 w-3" />
                                    <span className="font-medium">Shared</span>
                                </div>
                            )}
                        </div>

                        {/* Quick Actions (visible on hover on desktop) */}
                        <div className="hidden sm:flex absolute bottom-4 right-4 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => onDownload?.(file.id)}
                                className="p-2 bg-white hover:bg-gray-50 rounded-lg shadow-md transition-colors"
                                title="Download"
                            >
                                <Download className="h-4 w-4 text-gray-700" />
                            </button>
                            <button
                                onClick={() => onShare?.(file.id)}
                                className="p-2 bg-white hover:bg-gray-50 rounded-lg shadow-md transition-colors"
                                title="Share"
                            >
                                <Share2 className="h-4 w-4 text-gray-700" />
                            </button>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
