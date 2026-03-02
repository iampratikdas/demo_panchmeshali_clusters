import { useState } from 'react';
import { X, Mail, Link as LinkIcon, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import type { EmailTheme, WorkspaceFile } from '../types/workspace';
import { cn } from '../lib/utils';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    onShare: (emails: string[], theme: EmailTheme, message: string) => void;
    file: WorkspaceFile | null;
}

const emailThemes: { id: EmailTheme; name: string; description: string; gradient: string }[] = [
    {
        id: 'professional',
        name: 'Professional',
        description: 'Corporate blue theme',
        gradient: 'bg-gradient-to-br from-blue-500 to-blue-700',
    },
    {
        id: 'modern',
        name: 'Modern',
        description: 'Vibrant gradient',
        gradient: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500',
    },
    {
        id: 'minimal',
        name: 'Minimal',
        description: 'Clean white theme',
        gradient: 'bg-gradient-to-br from-gray-100 to-gray-300',
    },
];

export function ShareModal({ isOpen, onClose, onShare, file }: ShareModalProps) {
    const [emails, setEmails] = useState('');
    const [selectedTheme, setSelectedTheme] = useState<EmailTheme>('professional');
    const [message, setMessage] = useState('');
    const [linkCopied, setLinkCopied] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const emailList = emails.split(',').map(e => e.trim()).filter(e => e);
        onShare(emailList, selectedTheme, message);
        handleClose();
    };

    const handleClose = () => {
        setEmails('');
        setMessage('');
        setSelectedTheme('professional');
        setLinkCopied(false);
        onClose();
    };

    const copyLink = () => {
        const mockLink = `https://workspace.example.com/file/${file?.id}`;
        navigator.clipboard.writeText(mockLink);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    if (!file) return null;

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
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-50 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="glass-card rounded-2xl p-6 shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold">Share File</h2>
                                    <p className="text-sm text-muted-foreground">{file.name}</p>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Share Link */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <LinkIcon className="h-4 w-4 text-primary" />
                                    <h3 className="font-semibold text-sm">Share Link</h3>
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        value={`https://workspace.example.com/file/${file.id}`}
                                        readOnly
                                        className="flex-1 bg-white"
                                    />
                                    <Button
                                        type="button"
                                        onClick={copyLink}
                                        variant={linkCopied ? 'default' : 'outline'}
                                        className="flex items-center gap-2"
                                    >
                                        {linkCopied ? (
                                            <>
                                                <Check className="h-4 w-4" />
                                                Copied
                                            </>
                                        ) : (
                                            'Copy Link'
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                {/* Email Recipients */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        Email Recipients
                                    </label>
                                    <Input
                                        type="text"
                                        value={emails}
                                        onChange={(e) => setEmails(e.target.value)}
                                        placeholder="Enter emails separated by commas"
                                        className="w-full"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Separate multiple emails with commas
                                    </p>
                                </div>

                                {/* Email Theme Selection */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium mb-3">
                                        Email Theme
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {emailThemes.map((theme) => (
                                            <button
                                                key={theme.id}
                                                type="button"
                                                onClick={() => setSelectedTheme(theme.id)}
                                                className={cn(
                                                    'p-4 rounded-xl border-2 transition-all text-left',
                                                    selectedTheme === theme.id
                                                        ? 'border-primary ring-2 ring-primary/20'
                                                        : 'border-gray-200 hover:border-primary/50'
                                                )}
                                            >
                                                <div className={cn('h-16 rounded-lg mb-3', theme.gradient)} />
                                                <h4 className="font-semibold text-sm mb-1">{theme.name}</h4>
                                                <p className="text-xs text-muted-foreground">
                                                    {theme.description}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Message */}
                                <div className="mb-6">
                                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                                        Custom Message (Optional)
                                    </label>
                                    <textarea
                                        id="message"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Add a personal message..."
                                        className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                    />
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
                                        <Mail className="h-4 w-4 mr-2" />
                                        Send Email
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
