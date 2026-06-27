import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Building, Briefcase, FileText, Mail, Phone, Image as ImageIcon, Users, SpellCheck2, MapPin, Loader2,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { RoleUserSelect } from './RoleUserSelect';
import { fetchUsers } from '../lib/api';

export interface CompanyFormData {
    name: string;
    email: string;
    phone: string;
    rgst_gov_id: string;
    logo_url: string;
    description: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zip_code: string;
    status: string;
    uids: string[];
    proofreader_uids: string[];
}

interface Company {
    pid: string;
    name: string;
    email?: string;
    phone?: string;
    rgst_gov_id?: string;
    logo_url?: string;
    description?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zip_code?: string;
    status?: string;
    uids?: string[];
    proofreader_uids?: string[];
}

interface EditCompanyModalProps {
    isOpen: boolean;
    company: Company | null;
    onClose: () => void;
    onSave: (data: CompanyFormData) => void;
    isPending?: boolean;
}

const STATUS_OPTIONS = [
    { value: 'Active', label: 'Active' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Inactive', label: 'Inactive' },
];

export function EditCompanyModal({ isOpen, company, onClose, onSave, isPending }: EditCompanyModalProps) {
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', rgst_gov_id: '', logo_url: '', description: '',
        address: '', city: '', state: '', country: '', zip_code: '', status: 'Active',
    });
    const [selectedPublishers, setSelectedPublishers] = useState<any[]>([]);
    const [selectedProofreaders, setSelectedProofreaders] = useState<any[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const allUids = [...(company?.uids ?? []), ...(company?.proofreader_uids ?? [])];

    const { data: linkedUsersData, isLoading: linkedUsersLoading } = useQuery({
        queryKey: ['company-linked-users', company?.pid, allUids.join(',')],
        queryFn: () => fetchUsers(1, 100, { uids: allUids }),
        enabled: isOpen && !!company && allUids.length > 0,
        staleTime: 10_000,
    });

    const linkedUsers: any[] = linkedUsersData?.data ?? linkedUsersData?.users ?? [];

    useEffect(() => {
        if (company && isOpen) {
            setFormData({
                name: company.name || '',
                email: company.email || '',
                phone: company.phone || '',
                rgst_gov_id: company.rgst_gov_id || '',
                logo_url: company.logo_url || '',
                description: company.description || '',
                address: company.address || '',
                city: company.city || '',
                state: company.state || '',
                country: company.country || '',
                zip_code: company.zip_code || '',
                status: company.status || 'Active',
            });
            setErrors({});
        }
    }, [company, isOpen]);

    useEffect(() => {
        if (!company || !isOpen || linkedUsersLoading) return;

        const publisherUids = new Set(company.uids ?? []);
        const proofreaderUids = new Set(company.proofreader_uids ?? []);

        setSelectedPublishers(linkedUsers.filter(u => publisherUids.has(u.uid)));
        setSelectedProofreaders(linkedUsers.filter(u => proofreaderUids.has(u.uid)));
    }, [company, isOpen, linkedUsers, linkedUsersLoading]);

    useEffect(() => {
        if (!isOpen) {
            setSelectedPublishers([]);
            setSelectedProofreaders([]);
        }
    }, [isOpen]);

    const validate = (): boolean => {
        const next: Record<string, string> = {};
        if (!formData.name.trim()) next.name = 'Company name is required';
        if (!formData.email.trim()) next.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) next.email = 'Enter a valid email';
        if (!formData.phone.trim()) next.phone = 'Phone is required';
        if (!formData.rgst_gov_id.trim()) next.rgst_gov_id = 'Registration ID is required';
        if (selectedPublishers.length === 0) next.publishers = 'At least one publisher is required';
        if (selectedProofreaders.length === 0) next.proofreaders = 'At least one proofreader is required';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        onSave({
            ...formData,
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            rgst_gov_id: formData.rgst_gov_id.trim(),
            logo_url: formData.logo_url.trim(),
            description: formData.description.trim(),
            address: formData.address.trim(),
            city: formData.city.trim(),
            state: formData.state.trim(),
            country: formData.country.trim(),
            zip_code: formData.zip_code.trim(),
            uids: selectedPublishers.map(u => u.uid),
            proofreader_uids: selectedProofreaders.map(u => u.uid),
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    };

    return (
        <AnimatePresence>
            {isOpen && company && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-50 px-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="glass-card rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Building className="h-4 w-4 text-primary" />
                                    </div>
                                    <h2 className="text-xl font-bold">Edit Company</h2>
                                </div>
                                <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <p className="text-sm text-muted-foreground mb-5">
                                Update details for <span className="font-medium">{company.name}</span>
                            </p>

                            {linkedUsersLoading && allUids.length > 0 && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Loading team members...
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-semibold mb-1.5 block">Company Name *</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input name="name" value={formData.name} onChange={handleChange} className="pl-9" placeholder="Company name" />
                                        </div>
                                        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold mb-1.5 block">Status *</label>
                                        <Select
                                            value={formData.status}
                                            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                            options={STATUS_OPTIONS}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold mb-1.5 block">Government Registration ID *</label>
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input name="rgst_gov_id" value={formData.rgst_gov_id} onChange={handleChange} className="pl-9" />
                                        </div>
                                        {errors.rgst_gov_id && <p className="text-sm text-red-500 mt-1">{errors.rgst_gov_id}</p>}
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold mb-1.5 block">Email *</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input name="email" type="email" value={formData.email} onChange={handleChange} className="pl-9" />
                                        </div>
                                        {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="text-sm font-semibold mb-1.5 block">Phone *</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input name="phone" value={formData.phone} onChange={handleChange} className="pl-9" />
                                        </div>
                                        {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="text-sm font-semibold mb-1.5 block">Logo URL</label>
                                        <div className="relative">
                                            <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input name="logo_url" value={formData.logo_url} onChange={handleChange} className="pl-9" placeholder="https://example.com/logo.png" />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="text-sm font-semibold mb-1.5 block">Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            rows={3}
                                            placeholder="Brief description..."
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="text-sm font-semibold mb-1.5 block flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" /> Address
                                        </label>
                                        <Input name="address" value={formData.address} onChange={handleChange} placeholder="Street address" />
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold mb-1.5 block">City</label>
                                        <Input name="city" value={formData.city} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold mb-1.5 block">State</label>
                                        <Input name="state" value={formData.state} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold mb-1.5 block">Country</label>
                                        <Input name="country" value={formData.country} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold mb-1.5 block">Zip Code</label>
                                        <Input name="zip_code" value={formData.zip_code} onChange={handleChange} />
                                    </div>
                                </div>

                                <RoleUserSelect
                                    label="Managers / Publishers *"
                                    icon={Users}
                                    roles={['manager', 'publisher', 'both', 'admin']}
                                    selectedUsers={selectedPublishers}
                                    onChange={setSelectedPublishers}
                                    emptyMessage="No manager/publisher users found."
                                />
                                {errors.publishers && <p className="text-sm text-red-500">{errors.publishers}</p>}

                                <RoleUserSelect
                                    label="Proofreaders *"
                                    icon={SpellCheck2}
                                    roles={['proofreader']}
                                    selectedUsers={selectedProofreaders}
                                    onChange={setSelectedProofreaders}
                                    emptyMessage="No proofreader users found."
                                />
                                {errors.proofreaders && <p className="text-sm text-red-500">{errors.proofreaders}</p>}

                                <div className="flex gap-3 justify-end pt-2 border-t border-border">
                                    <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isPending || linkedUsersLoading}>
                                        {isPending ? 'Saving…' : 'Save Changes'}
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
