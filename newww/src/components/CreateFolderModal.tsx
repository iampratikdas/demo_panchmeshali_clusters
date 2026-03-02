import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { motion, AnimatePresence } from 'framer-motion';

interface CreateFolderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (folderName: string) => void;
    parentFolderName?: string;
}

export function CreateFolderModal({ isOpen, onClose, onConfirm, parentFolderName }: CreateFolderModalProps) {
    const [folderName, setFolderName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!folderName.trim()) {
            setError('Folder name is required');
            return;
        }
        onConfirm(folderName.trim());
        setFolderName('');
        setError('');
        onClose();
    };

    const handleClose = () => {
        setFolderName('');
        setError('');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        onClick={handleClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
                    >
                        <div className="glass-card rounded-2xl p-6 shadow-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold">Create New Folder</h2>
                                <button
                                    onClick={handleClose}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {parentFolderName && (
                                <p className="text-sm text-muted-foreground mb-4">
                                    in <span className="font-medium">{parentFolderName}</span>
                                </p>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="folderName" className="block text-sm font-medium mb-2">
                                        Folder Name
                                    </label>
                                    <Input
                                        id="folderName"
                                        type="text"
                                        value={folderName}
                                        onChange={(e) => {
                                            setFolderName(e.target.value);
                                            setError('');
                                        }}
                                        placeholder="Enter folder name"
                                        className="w-full"
                                        autoFocus
                                    />
                                    {error && (
                                        <p className="text-sm text-red-500 mt-1">{error}</p>
                                    )}
                                </div>

                                <div className="flex gap-3 justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleClose}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        Create Folder
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
