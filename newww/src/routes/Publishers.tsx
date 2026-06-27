import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { createPublisherCompany, updatePublisherCompany, fetchAllPublisherCompanies } from '../lib/api';
import { EditCompanyModal } from '../components/EditCompanyModal';
import type { CompanyFormData } from '../components/EditCompanyModal';
import { RoleUserSelect } from '../components/RoleUserSelect';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useToast } from '../hooks/useToast';
import {
    Building, Mail, Phone, FileText, Image as ImageIcon,
    Briefcase, Loader2, Users, X,
    Plus, List, Calendar, CheckCircle, Clock, SpellCheck2, Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Tab bar ────────────────────────────────────────────────────────────────
type Tab = 'create' | 'list';

export default function Publishers() {
    const [activeTab, setActiveTab] = useState<Tab>('list');
    const { toast } = useToast();

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
                <p className="text-muted-foreground mt-1">Create and manage companies registered in the system.</p>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-muted/50 rounded-xl border border-border/40 w-fit">
                {([
                    { key: 'list', label: 'Company List', icon: List },
                    { key: 'create', label: 'Create Publisher', icon: Plus },
                ] as { key: Tab; label: string; icon: any }[]).map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === key
                            ? 'bg-background text-foreground shadow-sm border border-border/30'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'list' ? (
                    <motion.div key="list" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                        <CompanyList onCreateClick={() => setActiveTab('create')} />
                    </motion.div>
                ) : (
                    <motion.div key="create" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
                        <CreatePublisherForm toast={toast} onSuccess={() => setActiveTab('list')} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Company List Tab ───────────────────────────────────────────────────────────────────
function CompanyList({ onCreateClick }: { onCreateClick: () => void }) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [editingCompany, setEditingCompany] = useState<any | null>(null);
    const { data: companies = [], isLoading, isError, refetch } = useQuery({
        queryKey: ['publisher-companies'],
        queryFn: fetchAllPublisherCompanies,
        staleTime: 30_000,
    });

    const updateMutation = useMutation({
        mutationFn: ({ pid, data }: { pid: string; data: CompanyFormData }) => updatePublisherCompany(pid, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['publisher-companies'] });
            setEditingCompany(null);
            toast({ title: 'Success', description: 'Company updated successfully.' });
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error?.response?.data?.message || error.message || 'Failed to update company.',
                variant: 'destructive',
            });
        },
    });

    const handleSaveCompany = (data: CompanyFormData) => {
        if (!editingCompany?.pid) return;
        updateMutation.mutate({ pid: editingCompany.pid, data });
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-36 rounded-xl bg-muted/40 animate-pulse border border-border/30" />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="py-10 text-center text-destructive">
                    <p className="font-medium">Failed to load publisher companies.</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>Retry</Button>
                </CardContent>
            </Card>
        );
    }

    if (companies.length === 0) {
        return (
            <Card className="border-border/40 bg-card/50">
                <CardContent className="py-16 flex flex-col items-center gap-4 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
                        <Building className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="font-semibold text-lg">No publisher companies yet</p>
                        <p className="text-muted-foreground text-sm mt-1">Create your first publisher company to get started.</p>
                    </div>
                    <Button onClick={onCreateClick} className="gap-2 mt-2">
                        <Plus className="h-4 w-4" /> Create Publisher
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">{companies.length} {companies.length === 1 ? 'company' : 'companies'} registered</p>
                <Button size="sm" onClick={onCreateClick} className="gap-2">
                    <Plus className="h-4 w-4" /> Add New
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {companies.map((company: any, idx: number) => (
                    <motion.div
                        key={company.pid || idx}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                    >
                        <Card
                            className="border-border/40 bg-card/60 hover:bg-card/90 hover:shadow-md transition-all group cursor-pointer"
                            onClick={() => setEditingCompany(company)}
                        >
                            <CardContent className="p-5">
                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        {company.logo_url ? (
                                            <img src={company.logo_url} alt={company.name} className="h-full w-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                                        ) : (
                                            <Building className="h-6 w-6 text-primary" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="font-semibold text-base leading-tight truncate flex items-center gap-2">
                                                {company.name}
                                                <Edit2 className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </h3>
                                            <StatusBadge status={company.status} />
                                        </div>

                                        {company.description && (
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{company.description}</p>
                                        )}

                                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                            {company.email && (
                                                <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{company.email}</span>
                                            )}
                                            {company.phone && (
                                                <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{company.phone}</span>
                                            )}
                                            {company.rgst_gov_id && (
                                                <span className="flex items-center gap-1"><FileText className="h-3 w-3" />ID: {company.rgst_gov_id}</span>
                                            )}
                                        </div>

                                        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground/70 flex-wrap">
                                            <span className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                {Array.isArray(company.uids) ? company.uids.length : 0} publisher{Array.isArray(company.uids) && company.uids.length !== 1 ? 's' : ''}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <SpellCheck2 className="h-3 w-3" />
                                                {Array.isArray(company.proofreader_uids) ? company.proofreader_uids.length : 0} proofreader{Array.isArray(company.proofreader_uids) && company.proofreader_uids.length !== 1 ? 's' : ''}
                                            </span>
                                            {company.createdAt && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(Number(company.createdAt) * 1000).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 text-xs"
                                                onClick={() => navigate({ to: '/publishers/$pid', params: { pid: company.pid } })}
                                            >
                                                View Profile
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <EditCompanyModal
                isOpen={!!editingCompany}
                company={editingCompany}
                onClose={() => setEditingCompany(null)}
                onSave={handleSaveCompany}
                isPending={updateMutation.isPending}
            />
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { cls: string; icon: any }> = {
        Active: { cls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: CheckCircle },
        Pending: { cls: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Clock },
        Inactive: { cls: 'bg-muted text-muted-foreground border-border', icon: X },
    };
    const cfg = map[status] ?? map['Pending'];
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${cfg.cls}`}>
            <Icon className="h-3 w-3" />
            {status}
        </span>
    );
}

// ─── Create Publisher Form Tab ───────────────────────────────────────────────
function CreatePublisherForm({ toast, onSuccess }: { toast: any; onSuccess: () => void }) {
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', description: '', logo_url: '', rgst_gov_id: '',
    });
    const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
    const [selectedProofreaders, setSelectedProofreaders] = useState<any[]>([]);

    const mutation = useMutation({
        mutationFn: (data: any) => createPublisherCompany(data),
        onSuccess: () => {
            toast({ title: 'Success', description: 'Publisher company created successfully.' });
            setFormData({ name: '', email: '', phone: '', description: '', logo_url: '', rgst_gov_id: '' });
            setSelectedUsers([]);
            setSelectedProofreaders([]);
            onSuccess();
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error?.response?.data?.message || error.message || 'Failed to create publisher company.',
                variant: 'destructive',
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedUsers.length === 0) {
            toast({ title: 'Validation Error', description: 'Please select at least one manager or publisher user.', variant: 'destructive' });
            return;
        }
        if (selectedProofreaders.length === 0) {
            toast({ title: 'Validation Error', description: 'Please select at least one proofreader.', variant: 'destructive' });
            return;
        }
        mutation.mutate({
            ...formData,
            uids: selectedUsers.map(u => u.uid),
            proofreader_uids: selectedProofreaders.map(u => u.uid),
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <Card className="border-border/50 shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader className="border-b border-border/10 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Building className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>Add New Publisher</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Company Name *</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input name="name" value={formData.name} onChange={handleChange} required className="pl-9" placeholder="Enter company name" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Government Registration ID *</label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input name="rgst_gov_id" value={formData.rgst_gov_id} onChange={handleChange} required className="pl-9" placeholder="e.g. GSTIN, PAN, CIN" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email Address *</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input name="email" type="email" value={formData.email} onChange={handleChange} required className="pl-9" placeholder="contact@company.com" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Phone Number *</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input name="phone" value={formData.phone} onChange={handleChange} required className="pl-9" placeholder="+91 98765 43210" />
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium">Logo URL</label>
                            <div className="relative">
                                <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input name="logo_url" value={formData.logo_url} onChange={handleChange} className="pl-9" placeholder="https://example.com/logo.png" />
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                placeholder="Brief description of the publisher..."
                                rows={3}
                            />
                        </div>

                        <RoleUserSelect
                            label="Assign Managers / Publishers *"
                            icon={Users}
                            roles={['manager', 'publisher', 'both', 'admin']}
                            selectedUsers={selectedUsers}
                            onChange={setSelectedUsers}
                            emptyMessage="No manager/publisher users found."
                        />

                        <RoleUserSelect
                            label="Assign Proofreaders *"
                            icon={SpellCheck2}
                            roles={['proofreader']}
                            selectedUsers={selectedProofreaders}
                            onChange={setSelectedProofreaders}
                            emptyMessage="No proofreader users found."
                        />
                    </div>

                    <div className="flex justify-end border-t border-border/10 pt-4 mt-6">
                        <Button type="submit" className="min-w-[160px]" disabled={mutation.isPending}>
                            {mutation.isPending ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                            ) : 'Create Publisher'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
