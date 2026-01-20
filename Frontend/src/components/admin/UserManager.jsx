import React, { useState } from 'react';
import {
    Plus,
    Search,
    Filter,
    Edit2,
    Trash2,
    UserMinus,
    UserCheck,
    X,
    Loader2,
    Command
} from 'lucide-react';
import { useUsersByRole, useToggleUserStatus, useDeleteUser, useOnboardUser } from '../../hooks/api/useAdminQueries';
import { useToast } from '../../hooks/useToast';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Skeleton } from '../ui/skeleton';
import { cn } from '../../lib/utils';

const UserManager = ({ targetRole, restricted = false }) => {
    const { data: users, isLoading } = useUsersByRole(targetRole);
    const toggleStatusMutation = useToggleUserStatus();
    const deleteMutation = useDeleteUser();
    const onboardMutation = useOnboardUser();

    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        employee_id: ''
    });

    const { showToast } = useToast();

    const handleToggleStatus = async (user) => {
        try {
            await toggleStatusMutation.mutateAsync({ userId: user.id, currentStatus: user.status });
            showToast('User status synchronized', 'success');
        } catch (err) {
            showToast('Status update failure', 'error');
        }
    };

    const handleDelete = async (userId) => {
        try {
            await deleteMutation.mutateAsync(userId);
            showToast('Record purged from ledger', 'success');
        } catch (err) {
            showToast('Data deletion conflict', 'error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await onboardMutation.mutateAsync({
                email: formData.email,
                password: 'Password123!', // Default password for new users
                profileData: {
                    full_name: formData.full_name,
                    employee_id: formData.employee_id,
                    role: targetRole
                }
            });
            showToast('User initialized successfully', 'success');
            setShowModal(false);
            setFormData({ full_name: '', email: '', employee_id: '' });
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const filteredUsers = users?.filter(u =>
        u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.employee_id && u.employee_id.toLowerCase().includes(searchTerm.toLowerCase()))
    ) || [];

    return (
        <div className="space-y-8 animate-fade-in text-foreground">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tighter uppercase">Manage_{targetRole}s</h2>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Personnel Directory & access control center.</p>
                </div>
                {!restricted && (
                    <Button
                        onClick={() => setShowModal(true)}
                        className="h-12 px-6 rounded-none bg-foreground text-background font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-transform"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Initialize_{targetRole}
                    </Button>
                )}
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 relative w-full">
                    <Command className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="SEARCH_LEDGER..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 h-12 rounded-none border-foreground/10 bg-secondary/50 font-black uppercase tracking-widest text-[10px] focus-visible:ring-0 focus-visible:border-foreground"
                    />
                </div>
                <Button variant="outline" className="h-12 w-full md:w-auto px-6 rounded-none text-[10px] uppercase font-black tracking-widest border-foreground/10">
                    <Filter className="w-3.5 h-3.5 mr-2" />
                    STATUS:ALL
                </Button>
            </div>

            {/* Table Card */}
            <Card className="rounded-none border-foreground/10 shadow-none">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-secondary/50 border-b border-foreground/5">
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">Serial NO.</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Identity Profile</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">Status protocol</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-foreground/5">
                                {isLoading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i}>
                                            <td className="px-6 py-6"><Skeleton className="h-4 w-12 mx-auto" /></td>
                                            <td className="px-6 py-6"><Skeleton className="h-4 w-48" /></td>
                                            <td className="px-6 py-6"><Skeleton className="h-6 w-20 mx-auto rounded-full" /></td>
                                            <td className="px-6 py-6 text-right"><Skeleton className="h-8 w-24 ml-auto" /></td>
                                        </tr>
                                    ))
                                ) : filteredUsers.length === 0 ? (
                                    <tr><td colSpan="4" className="text-center py-20 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Empty_Registry_Ledger</td></tr>
                                ) : filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-secondary/30 transition-colors group">
                                        <td className="px-6 py-6 text-center">
                                            <span className="font-black text-[9px] text-muted-foreground border border-foreground/10 px-2 py-1 rounded-sm">{user.employee_id || 'U_NON'}</span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-9 h-9 rounded-sm bg-foreground text-background flex items-center justify-center font-black text-xs">
                                                    {user.full_name?.charAt(0) || '?'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-black text-xs uppercase tracking-tighter">{user.full_name}</p>
                                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className={cn(
                                                "inline-flex items-center gap-2 px-3 py-1 text-[9px] font-black uppercase tracking-widest border",
                                                user.status === 'active' ? 'bg-secondary border-foreground/20' : 'bg-muted text-muted-foreground grayscale'
                                            )}>
                                                <div className={cn("w-1.5 h-1.5 rounded-full", user.status === 'active' ? 'bg-black animate-pulse' : 'bg-muted-foreground')} />
                                                {user.status || 'OFFLINE'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center justify-end gap-2 group-hover:opacity-100 opacity-20 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none hover:bg-black hover:text-white" title="MOD_RECORD">
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-none hover:bg-black hover:text-white"
                                                    disabled={toggleStatusMutation.isLoading}
                                                    onClick={() => handleToggleStatus(user)}
                                                >
                                                    {user.status === 'active' ? <UserMinus className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                                                </Button>
                                                {!restricted && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-none hover:bg-black hover:text-white"
                                                        disabled={deleteMutation.isLoading}
                                                        onClick={() => handleDelete(user.id)}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <Card className="relative w-full max-w-md rounded-none border-white/20 bg-black text-white p-10 animate-fade-in shadow-2xl">
                        <div className="flex items-center justify-between mb-12">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black tracking-tighter uppercase">Initialize_Session</h3>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">onboard_new_personnel_record</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setShowModal(false)} className="text-white/40 hover:text-white hover:bg-white/10">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        <form className="space-y-8" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">LEGAL_IDENTITY_NAME</label>
                                <Input
                                    required
                                    className="h-12 bg-white/5 border-white/10 rounded-none focus-visible:ring-0 focus-visible:border-white font-black uppercase text-[10px] tracking-widest p-4 text-white"
                                    placeholder="ENTRY_NAME"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">COMMUNICATION_ADDRESS</label>
                                <Input
                                    type="email"
                                    required
                                    className="h-12 bg-white/5 border-white/10 rounded-none focus-visible:ring-0 focus-visible:border-white font-black uppercase text-[10px] tracking-widest p-4 text-white"
                                    placeholder="ENTRY_EMAIL@DOMAIN"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">PERSONNEL_ID_CODE</label>
                                <Input
                                    required
                                    className="h-12 bg-white/5 border-white/10 rounded-none focus-visible:ring-0 focus-visible:border-white font-black uppercase text-[10px] tracking-widest p-4 text-white"
                                    placeholder="ID_SERIAL_000"
                                    value={formData.employee_id}
                                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={onboardMutation.isLoading}
                                className="w-full h-14 bg-white text-black font-black uppercase tracking-[0.3em] text-[11px] rounded-none hover:bg-neutral-200 transition-all mt-6"
                            >
                                {onboardMutation.isLoading ? "INITIALIZING..." : "CONFIRM_ONBOARD"}
                            </Button>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default UserManager;
