import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsers, createUser, updateUser, sendEmail } from '../lib/api';
import type { EmailData, User } from '../types/user';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { Pagination } from '../components/Pagination';
import { Users as UsersIcon, Plus, Mail, Ban, Trash2, CheckCircle2, XCircle, Search, ArrowUpDown } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import type { CreateUserData } from '../types/user';

export default function Users() {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEmailDialog, setShowEmailDialog] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [emailData, setEmailData] = useState({ subject: '', message: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    // UI Filters
    const [filterEmail, setFilterEmail] = useState('');
    const [filterFullName, setFilterFullName] = useState('');
    const [filterPhone, setFilterPhone] = useState('');
    const [filterUid, setFilterUid] = useState('');
    const [filterIsActive, setFilterIsActive] = useState('all');
    const [filterIsDeleted, setFilterIsDeleted] = useState('all');
    const [filterRole, setFilterRole] = useState('All');

    const [debouncedFilters, setDebouncedFilters] = useState({
        email: '', full_name: '', phone_number: '', uid: '', isActive: 'all', is_deleted: 'all', role: 'All'
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // Default: newest first
    // const pageSize = 1;
    const [pageSize, setPageSize] = useState(6);

    const [formData, setFormData] = useState<User>({
        full_name: '',
        email: '',
        password: '', // In real app, this would be hashed
        isActive: false,
        createdAt: '',
        lastLogin: '',
        role: '',
        ph_country_code: '',
        phone_number: '',
        // status: boolean;
        address: '',
    });

    const queryClient = useQueryClient();
    const { toast } = useToast();

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
            setDebouncedFilters({
                email: filterEmail,
                full_name: filterFullName,
                phone_number: filterPhone,
                uid: filterUid,
                isActive: filterIsActive,
                is_deleted: filterIsDeleted,
                role: filterRole
            });
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, filterEmail, filterFullName, filterPhone, filterUid, filterIsActive, filterIsDeleted, filterRole]);

    const { data: fetchResponse, isLoading, error: fetchUserError, isError } = useQuery({
        queryKey: ['users', currentPage, pageSize, debouncedSearchQuery, debouncedFilters],
        queryFn: () => fetchUsers(currentPage, pageSize, { searchQuery: debouncedSearchQuery, ...debouncedFilters }),
    });
    console.log("fetchUserError============>", fetchUserError, isError);

    const users: User[] = fetchResponse?.data || [];
    const serverTotalPages = fetchResponse?.pagination?.totalPages || 1;

    const createMutation = useMutation({
        mutationFn: (data: CreateUserData) => createUser(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast({ title: 'Success!', description: 'User created successfully.' });
            setShowCreateForm(false);
            setFormData({
                full_name: '',
                email: '',
                password: '', // In real app, this would be hashed
                isActive: false,
                createdAt: '',
                // lastLogin: '',
                role: '',
                ph_country_code: '',
                phone_number: '',
                // status: boolean;
                address: '',
            });
        },
        onError: (error: Error) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        },
    });

    const banMutation = useMutation({
        mutationFn: (userId: string) => updateUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast({ title: 'Success!', description: 'User banned successfully.' });
        },
    });

    const removeMutation = useMutation({
        mutationFn: (userId: string) => updateUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast({ title: 'Success!', description: 'User removed successfully.' });
        },
    });

    const emailMutation = useMutation({
        mutationFn: (data: EmailData) => sendEmail(data),
        onSuccess: (response) => {
            toast({ title: 'Success!', description: response.message });
            setShowEmailDialog(false);
            setSelectedUsers([]);
            setEmailData({ subject: '', message: '' });
        },
    });

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(formData);
    };

    const toggleUserSelection = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const selectAllUsers = () => {
        if (users) {
            const allIds = users.map(u => u.uid || '');
            setSelectedUsers(allIds);
        }
    };

    const handleSendEmail = (recipients: string[]) => {
        const emailList = users?.filter(u => recipients.includes(u?.uid || '')).map(u => u.email) || [];
        emailMutation.mutate({
            to: emailList,
            subject: emailData.subject,
            message: emailData.message,
        });
    };

    // Client-side sorting on the current paginated result from server
    const filteredAndSortedUsers = [...users].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    const totalPages = Math.max(1, serverTotalPages);
    const paginatedUsers = filteredAndSortedUsers;

    // Reset to page 1 when search changes
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
    };

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
        setCurrentPage(1);
    };
    const clearAllFilters = () => {
        setSearchQuery('');
        setFilterEmail('');
        setFilterFullName('');
        setFilterPhone('');
        setFilterUid('');
        setFilterIsActive('all');
        setFilterIsDeleted('all');
        setFilterRole('All');
        setCurrentPage(1);
    };

    if (isError) {
        return <div className="flex items-center justify-center h-screen">
            <div className="text-center">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Error</h1>
                <p className="text-sm sm:text-base text-muted-foreground">{fetchUserError?.message}</p>
            </div>
        </div>
    }
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="w-full sm:w-auto">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Users Management</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">Manage users, send emails, and moderate accounts</p>
                </div>
                <Button onClick={() => setShowCreateForm(!showCreateForm)} className="h-12 w-full sm:w-auto gap-2">
                    <Plus className="h-4 w-4" />
                    {showCreateForm ? 'Cancel' : 'Create User'}
                </Button>
            </div>

            {/* Create User Form */}
            {showCreateForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Create New User</CardTitle>
                        <CardDescription>Add a new user to the system</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Full Name</label>
                                <Input required value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} placeholder="e.g., John Doe" />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Email</label>
                                <Input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="john.doe@example.com" />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Password</label>
                                <Input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" />
                            </div>
                            <Button type="submit" disabled={createMutation.isPending} className="w-full sm:w-auto">
                                {createMutation.isPending ? 'Creating...' : 'Create User'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Search and Sort Bar */}
            <div className="glass-card rounded-xl p-4 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Global search by name or email..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    <Input
                        placeholder="Filter by Email"
                        value={filterEmail}
                        onChange={(e) => { setFilterEmail(e.target.value); setCurrentPage(1); }}
                    />
                    <Input
                        placeholder="Filter by Full Name"
                        value={filterFullName}
                        onChange={(e) => { setFilterFullName(e.target.value); setCurrentPage(1); }}
                    />
                    <Input
                        placeholder="Filter by Phone Number"
                        value={filterPhone}
                        onChange={(e) => { setFilterPhone(e.target.value); setCurrentPage(1); }}
                    />
                    <Input
                        placeholder="Filter by UID"
                        value={filterUid}
                        onChange={(e) => { setFilterUid(e.target.value); setCurrentPage(1); }}
                    />

                    <Select
                        value={filterIsActive}
                        onChange={(e) => { setFilterIsActive(e.target.value); setCurrentPage(1); }}
                        options={[
                            { value: 'all', label: 'All Status' },
                            { value: 'true', label: 'Active Only' },
                            { value: 'false', label: 'Inactive Only' }
                        ]}
                    />

                    <Select
                        value={filterIsDeleted}
                        onChange={(e) => { setFilterIsDeleted(e.target.value); setCurrentPage(1); }}
                        options={[
                            { value: 'all', label: 'All (Deleted/Not)' },
                            { value: 'true', label: 'Deleted Only' },
                            { value: 'false', label: 'Not Deleted' }
                        ]}
                    />

                    <Select
                        value={filterRole}
                        onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}
                        options={[
                            { value: 'All', label: 'All Roles' },
                            { value: 'admin', label: 'Admin' },
                            { value: 'user', label: 'User' },
                            { value: 'both', label: 'Admin & User' }
                        ]}
                    />

                    <Button
                        // variant="outline"
                        onClick={clearAllFilters}
                        // style={{ backgroundColor: "#eb8741 !important", color: "#030202ff !important" }}
                        // className="w-full hover:text-white" 
                        style={{ backgroundColor: "#cb8959ff", color: "#ffffffff", cursor: "pointer" }}
                        className="w-full "
                    >
                        Clear All Filter
                    </Button>
                    {/* <Button
                        onClick={clearAllFilters}
                        style={{ backgroundColor: '#eb8741', color: '#030202' }}
                        className="w-full border-0 font-semibold shadow-md hover:opacity-90"
                    >
                        Clear All Filters
                    </Button> */}
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
                <Card className="bg-primary/5 border-primary">
                    <CardContent className="py-4">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <p className="text-sm font-medium w-full sm:w-auto text-center sm:text-left">{selectedUsers.length} user(s) selected</p>
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                <Button className="w-full sm:w-auto" variant="outline" size="sm" onClick={() => { setShowEmailDialog(true); }}>
                                    <Mail className="h-4 w-4 mr-2" />
                                    Email Selected
                                </Button>
                                <Button className="w-full sm:w-auto" style={{ backgroundColor: "#eb8741 !important", color: "#fff !important" }} variant="outline" size="sm" onClick={() => setSelectedUsers([])}>Clear Selection</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Email Dialog */}
            {showEmailDialog && (
                <Card className="border-primary">
                    <CardHeader>
                        <CardTitle>Send Email</CardTitle>
                        <CardDescription>Sending to {selectedUsers.length} recipient(s)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Subject</label>
                            <Input value={emailData.subject} onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })} placeholder="Email subject" />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Message</label>
                            <textarea className="w-full min-h-[120px] px-3 py-2 border rounded-lg resize-none" value={emailData.message} onChange={(e) => setEmailData({ ...emailData, message: e.target.value })} placeholder="Your message..." />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => handleSendEmail(selectedUsers)} disabled={emailMutation.isPending || !emailData.subject || !emailData.message}>
                                {emailMutation.isPending ? 'Sending...' : 'Send Email'}
                            </Button>
                            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>Cancel</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Users List */}
            {isLoading ? (
                <LoadingSkeleton />
            ) : (
                <>
                    {filteredAndSortedUsers.length > 0 && (
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={selectAllUsers}>Select All</Button>
                                <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => { setShowEmailDialog(true); selectAllUsers(); }}>
                                    <Mail className="h-4 w-4 mr-2" />
                                    {localStorage.getItem("role") === "admin" ? `Email All` : `Login to Email All`}
                                </Button>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                                <span className="text-sm text-muted-foreground whitespace-nowrap">Rows per page:</span>
                                <Select
                                    className="w-[80px] h-9 cursor-pointer  rounded-md"
                                    style={{ border: "1px solid #cb8959" }}
                                    value={pageSize.toString()}
                                    onChange={(e) => {
                                        setPageSize(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    options={[
                                        { value: '5', label: '5' },
                                        { value: '10', label: '10' },
                                        { value: '20', label: '20' },
                                        { value: '50', label: '50' }
                                    ]}
                                />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {paginatedUsers.map((user: User) => (
                            <Card key={user.uid} className={`hover:shadow-lg transition-shadow ${selectedUsers.includes(user.uid || '') ? 'border-primary' : ''}`}>
                                <CardHeader>
                                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 flex-1 w-full">
                                            <input type="checkbox" checked={selectedUsers.includes(user.uid || '')} onChange={() => toggleUserSelection(user.uid || '')} className="mt-1 h-4 w-4 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <CardTitle className="text-lg truncate block pb-1">{user.full_name}</CardTitle>
                                                <CardDescription className="w-full break-all whitespace-normal text-sm block">{user.email}</CardDescription>
                                            </div>
                                        </div>
                                        {user.isActive ? (
                                            <Badge className="bg-green-500 flex-shrink-0 self-start">
                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                Active
                                            </Badge>
                                        ) : (
                                            <Badge variant="destructive" className="flex-shrink-0 self-start">
                                                <XCircle className="h-3 w-3 mr-1" />
                                                In Active
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="text-sm text-muted-foreground">
                                        <p>ID: {user.uid}</p>
                                        <p>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                                        {user.lastLogin && <p>Last login: {new Date(user.lastLogin).toLocaleDateString()}</p>}
                                    </div>

                                    <div className="flex gap-2 flex-wrap items-center mt-4">
                                        <Button variant="outline" size="sm" className="flex-1 min-w-[80px]" onClick={() => handleSendEmail([user.uid || ''])}>
                                            <Mail className="h-4 w-4 mr-2" />
                                            Email
                                        </Button>
                                        {
                                            localStorage.getItem("role") === "admin" ?
                                                user.isActive ? (
                                                    <Button variant="outline" size="sm" className="flex-1 min-w-[80px]" onClick={() => banMutation.mutate(user.uid || '')} disabled={banMutation.isPending}>
                                                        <Ban className="h-4 w-4 mr-2" />
                                                        In Active
                                                    </Button>
                                                ) : (
                                                    <Badge variant="outline" className="flex-1 justify-center py-1.5 min-w-[80px]">Active</Badge>
                                                )
                                                : null
                                        }

                                        {
                                            localStorage.getItem("role") === "admin" ?
                                                <Button variant="destructive" size="sm" className="flex-1 min-w-[80px]" onClick={() => removeMutation.mutate(user.uid || '')} disabled={removeMutation.isPending}>
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Remove Account
                                                </Button>
                                                : <Button variant="destructive" size="sm" className="flex-1 min-w-[80px]" onClick={() => removeMutation.mutate(user.uid || '')} disabled={removeMutation.isPending}>
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Remove User
                                                </Button>
                                        }
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {filteredAndSortedUsers.length === 0 && (
                        <div className="text-center py-12">
                            <UsersIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                                {searchQuery ? 'No users found matching your search.' : 'No users found. Click "Create User" to add one.'}
                            </p>
                        </div>
                    )}

                    {/* Pagination — always visible */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={Math.max(1, totalPages)}
                        onPageChange={setCurrentPage}
                    />
                </>
            )}
        </div>
    );
}
