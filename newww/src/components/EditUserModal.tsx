import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import type { User } from '../types/user';

export interface EditUserFormData {
    full_name: string;
    email: string;
    ph_country_code: string;
    phone_number: string;
    role: string;
    address: string;
}

interface EditUserModalProps {
    isOpen: boolean;
    user: User | null;
    onClose: () => void;
    onSave: (data: EditUserFormData) => void;
    isPending?: boolean;
}

const ROLE_OPTIONS = [
    { value: 'user', label: 'User (Writer)' },
    { value: 'publisher', label: 'Publisher' },
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'proofreader', label: 'Proofreader' },
    { value: 'both', label: 'Both (Admin + User)' },
];

export function EditUserModal({ isOpen, user, onClose, onSave, isPending }: EditUserModalProps) {
    const [formData, setFormData] = useState<EditUserFormData>({
        full_name: '',
        email: '',
        ph_country_code: '',
        phone_number: '',
        role: 'user',
        address: '',
    });
    const [errors, setErrors] = useState<Partial<Record<keyof EditUserFormData, string>>>({});

    useEffect(() => {
        if (user && isOpen) {
            setFormData({
                full_name: user.full_name || '',
                email: user.email || '',
                ph_country_code: user.ph_country_code || '',
                phone_number: user.phone_number || '',
                role: user.role || 'user',
                address: user.address || '',
            });
            setErrors({});
        }
    }, [user, isOpen]);

    const validate = (): boolean => {
        const next: Partial<Record<keyof EditUserFormData, string>> = {};
        if (!formData.full_name.trim()) next.full_name = 'Name is required';
        if (!formData.email.trim()) next.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) next.email = 'Enter a valid email';
        if (!formData.role) next.role = 'Role is required';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        onSave({
            full_name: formData.full_name.trim(),
            email: formData.email.trim(),
            ph_country_code: formData.ph_country_code.trim(),
            phone_number: formData.phone_number.trim(),
            role: formData.role,
            address: formData.address.trim(),
        });
    };

    const handleClose = () => {
        setErrors({});
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && user && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        style={{ margin: "0px" }}
                        onClick={handleClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 px-4" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="glass-card rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-1">
                                <h2 className="text-xl font-bold">Edit User</h2>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <p className="text-sm text-muted-foreground mb-5">
                                Update profile for <span className="font-medium">{user.full_name}</span>
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-sm font-semibold mb-1.5 block">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        placeholder="Full name"
                                    />
                                    {errors.full_name && <p className="text-sm text-red-500 mt-1">{errors.full_name}</p>}
                                </div>

                                <div>
                                    <label className="text-sm font-semibold mb-1.5 block">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="email@example.com"
                                    />
                                    {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-sm font-semibold mb-1.5 block">Country Code</label>
                                        <Input
                                            value={formData.ph_country_code}
                                            onChange={(e) => setFormData({ ...formData, ph_country_code: e.target.value })}
                                            placeholder="+91"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-sm font-semibold mb-1.5 block">Phone Number</label>
                                        <Input
                                            type="tel"
                                            value={formData.phone_number}
                                            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                            placeholder="9876543210"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold mb-1.5 block">
                                        Role <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        options={ROLE_OPTIONS}
                                    />
                                    {errors.role && <p className="text-sm text-red-500 mt-1">{errors.role}</p>}
                                </div>

                                <div>
                                    <label className="text-sm font-semibold mb-1.5 block">Address</label>
                                    <Input
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="City, Country"
                                    />
                                </div>

                                <div className="flex gap-3 justify-end pt-2 border-t border-border">
                                    <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isPending}>
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
