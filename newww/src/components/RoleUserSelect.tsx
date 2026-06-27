import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Loader2, X } from 'lucide-react';
import { fetchUsers } from '../lib/api';

interface RoleUserSelectProps {
    label: string;
    icon: any;
    roles: string[];
    selectedUsers: any[];
    onChange: (users: any[]) => void;
    emptyMessage: string;
    roleBadgeClass?: (role: string) => string;
}

export function RoleUserSelect({
    label,
    icon: Icon,
    roles,
    selectedUsers,
    onChange,
    emptyMessage,
    roleBadgeClass,
}: RoleUserSelectProps) {
    const [search, setSearch] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { data: usersData, isLoading: usersLoading } = useQuery({
        queryKey: ['role-users', roles.join(','), search],
        queryFn: () => fetchUsers(1, 50, {
            roles,
            searchQuery: search || undefined,
        }),
        staleTime: 30_000,
    });
    const availableUsers: any[] = usersData?.data ?? usersData?.users ?? [];

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const toggleUser = (user: any) => {
        onChange(
            selectedUsers.find(u => u.uid === user.uid)
                ? selectedUsers.filter(u => u.uid !== user.uid)
                : [...selectedUsers, user]
        );
    };

    const filteredUsers = availableUsers.filter(u => !selectedUsers.find(s => s.uid === u.uid));
    const defaultBadgeClass = (role: string) =>
        role === 'proofreader' ? 'bg-violet-500/10 text-violet-500' : role === 'publisher' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500';

    return (
        <div className="space-y-2 md:col-span-2" ref={dropdownRef}>
            <label className="text-sm font-medium flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                {label}
            </label>

            {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedUsers.map(u => (
                        <span key={u.uid} className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full border border-primary/20">
                            {u.full_name}
                            <span className="text-muted-foreground capitalize">({u.role})</span>
                            <button type="button" onClick={() => onChange(selectedUsers.filter(x => x.uid !== u.uid))} className="ml-1 hover:text-destructive transition-colors">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            <div
                className="relative flex items-center gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm cursor-pointer shadow-sm hover:border-primary/50 transition-colors"
                onClick={() => setDropdownOpen(v => !v)}
            >
                <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <input
                    className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setDropdownOpen(true); }}
                    onClick={e => e.stopPropagation()}
                />
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            <AnimatePresence>
                {dropdownOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="relative z-50 w-full mt-1 max-h-56 overflow-y-auto rounded-lg border border-border bg-card shadow-xl"
                    >
                        {usersLoading ? (
                            <div className="flex items-center justify-center py-6 gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" /> Loading users...
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">{emptyMessage}</div>
                        ) : (
                            filteredUsers.map(user => (
                                <div
                                    key={user.uid}
                                    onClick={() => { toggleUser(user); setDropdownOpen(false); setSearch(''); }}
                                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/60 transition-colors border-b border-border/30 last:border-none"
                                >
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                                        {user.full_name?.[0]?.toUpperCase() ?? '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{user.full_name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${(roleBadgeClass ?? defaultBadgeClass)(user.role)}`}>
                                        {user.role}
                                    </span>
                                </div>
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
