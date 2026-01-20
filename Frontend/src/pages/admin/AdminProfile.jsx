import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Key, Bell, Globe, Camera, Save, Loader2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import { useToast } from '../../hooks/useToast';
import AppLogger from '../../utils/AppLogger';

const AdminProfile = () => {
    const { profile, updateProfile } = useSupabaseAuth();
    const { showToast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');

    useEffect(() => {
        if (profile) setName(profile.full_name);
    }, [profile]);

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateProfile({ full_name: name });
            showToast('Profile updated successfully!', 'success');
            setIsEditing(false);
        } catch (err) {
            AppLogger.error('Admin profile update failure', err);
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
                {/* Profile Header */}
                <div className="relative">
                    <div className="h-48 w-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] shadow-lg"></div>
                    <div className="absolute -bottom-12 left-12 flex items-end gap-6">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-3xl bg-white p-1.5 shadow-xl">
                                <div className="w-full h-full rounded-[1.25rem] bg-slate-100 flex items-center justify-center text-4xl font-black text-slate-300 overflow-hidden">
                                    {profile?.full_name?.charAt(0) || <User className="w-12 h-12" />}
                                </div>
                            </div>
                            <button className="absolute bottom-2 right-2 p-2 bg-white rounded-xl shadow-lg border border-slate-100 text-slate-600 hover:text-indigo-600 transition-all">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="pb-4">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{profile?.full_name || 'System Admin'}</h1>
                            <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest mt-1 flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                Master Administrator
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
                    {/* Public Info */}
                    <div className="md:col-span-2 space-y-8">
                        <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold flex items-center gap-3 text-slate-900">
                                    <User className="w-5 h-5 text-indigo-500" />
                                    Account Identity
                                </h2>
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-xs font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 underline underline-offset-4"
                                    >
                                        Edit Details
                                    </button>
                                ) : (
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={loading}
                                            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700"
                                        >
                                            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                            Save Changes
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Legal Name</label>
                                    <input
                                        type="text"
                                        readOnly={!isEditing}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className={`w-full px-5 py-3.5 border-none rounded-2xl font-bold transition-all ${isEditing ? 'bg-slate-50 ring-2 ring-indigo-500/10 text-slate-900' : 'bg-slate-50/50 text-slate-600'}`}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Employee ID</label>
                                    <input type="text" readOnly value={profile?.employee_id || 'SYSTEM-001'} className="w-full px-5 py-3.5 bg-slate-50/50 border-none rounded-2xl font-bold text-slate-500 cursor-not-allowed" />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Primary Email Address</label>
                                    <div className="flex gap-2">
                                        <input type="text" readOnly value={profile?.email || ''} className="flex-1 px-5 py-3.5 bg-slate-50/50 border-none rounded-2xl font-bold text-slate-500 cursor-not-allowed" />
                                        <button className="px-5 bg-indigo-50 text-indigo-600 font-bold rounded-2xl text-xs uppercase tracking-widest opacity-50 cursor-not-allowed">Verify</button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                            <h2 className="text-xl font-bold flex items-center gap-3 text-slate-900">
                                <Key className="w-5 h-5 text-indigo-500" />
                                Security Credentials
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white rounded-xl text-slate-400">
                                            <Bell className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 leading-tight">Password Management</p>
                                            <p className="text-xs font-medium text-slate-400 mt-0.5">Last updated 12 days ago</p>
                                        </div>
                                    </div>
                                    <button className="px-6 py-3 bg-white border border-slate-200 text-slate-900 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">Change</button>
                                </div>
                                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white rounded-xl text-slate-400">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 leading-tight">Two-Factor Authentication</p>
                                            <p className="text-xs font-medium text-slate-400 mt-0.5">Currently DISABLED</p>
                                        </div>
                                    </div>
                                    <button className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">Enable</button>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Preferences */}
                    <div className="space-y-8">
                        <section className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl shadow-slate-200">
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-3">
                                <Globe className="w-5 h-5 text-indigo-400" />
                                Preferences
                            </h2>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between group cursor-pointer">
                                    <span className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">Language</span>
                                    <span className="text-sm font-black uppercase tracking-widest text-indigo-400">English (US)</span>
                                </div>
                                <div className="flex items-center justify-between group cursor-pointer">
                                    <span className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">Timezone</span>
                                    <span className="text-sm font-black uppercase tracking-widest text-indigo-400">GMT +5:30</span>
                                </div>
                                <div className="flex items-center justify-between group cursor-pointer">
                                    <span className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">Theme Mode</span>
                                    <span className="text-sm font-black uppercase tracking-widest text-indigo-400">Aurora Light</span>
                                </div>
                            </div>
                        </section>

                        <div className="p-8 bg-rose-50 rounded-[2.5rem] border border-rose-100">
                            <h4 className="text-rose-600 font-black text-xs uppercase tracking-widest mb-3">Zone of Danger</h4>
                            <p className="text-rose-500/80 text-xs font-medium leading-relaxed mb-6">Requesting account suspension will lock all global system administrative privileges.</p>
                            <button className="w-full py-4 text-xs font-black uppercase tracking-widest text-rose-600 bg-white border border-rose-200 rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-sm">Initialize Core Shutdown</button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminProfile;
