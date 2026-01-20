import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Key, Bell, Globe, Camera, Briefcase } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import { useToast } from '../../hooks/useToast';
import AppLogger from '../../utils/AppLogger';

const HRProfile = () => {
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
            showToast('HR Profile updated.', 'success');
            setIsEditing(false);
        } catch (err) {
            AppLogger.error('HR profile update failure', err);
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                {/* Profile Header */}
                <div className="relative">
                    <div className="h-56 w-full bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[3rem] shadow-xl"></div>
                    <div className="absolute -bottom-12 left-12 flex items-end gap-8">
                        <div className="relative">
                            <div className="w-36 h-36 rounded-[2.5rem] bg-white p-2 shadow-2xl">
                                <div className="w-full h-full rounded-[2rem] bg-slate-100 flex items-center justify-center text-5xl font-black text-slate-300 overflow-hidden">
                                    {profile?.full_name?.charAt(0) || <User className="w-16 h-16" />}
                                </div>
                            </div>
                            <button className="absolute bottom-2 right-2 p-2.5 bg-white rounded-2xl shadow-lg border border-slate-100 text-slate-600 hover:text-emerald-600 transition-all">
                                <Camera className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="pb-6">
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{profile?.full_name || 'HR Manager'}</h1>
                            <div className="flex items-center gap-3 mt-2">
                                <p className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full">
                                    <Shield className="w-4 h-4" />
                                    {profile?.job_title || 'HR Specialist'}
                                </p>
                                <p className="text-sm font-bold text-slate-400 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4" />
                                    Human Resources
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-24">
                    {/* Identity Info */}
                    <div className="md:col-span-2 space-y-10">
                        <section className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black flex items-center gap-4 text-slate-900">
                                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                                        <User className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    Personnel Identity
                                </h2>
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 underline underline-offset-8"
                                    >
                                        Update Identity
                                    </button>
                                ) : (
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={loading}
                                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700"
                                        >
                                            {loading ? <div className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div> : <Key className="w-3 h-3" />}
                                            Commit Changes
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-10">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Assigned Name</label>
                                    <input
                                        type="text"
                                        readOnly={!isEditing}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className={`w-full px-6 py-4 border-none rounded-2xl font-bold transition-all ${isEditing ? 'bg-slate-50 ring-2 ring-emerald-500/10 text-slate-900' : 'bg-slate-50 text-slate-700'}`}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Staff Serial</label>
                                    <input type="text" readOnly value={profile?.employee_id || 'HR-SEC-09'} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500/20" />
                                </div>
                                <div className="col-span-2 space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Corporate Correspondence</label>
                                    <div className="flex gap-3">
                                        <input type="text" readOnly value={profile?.email || ''} className="flex-1 px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700" />
                                        <button className="px-8 bg-emerald-50 text-emerald-600 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-emerald-100 transition-all border border-emerald-100">Synchronize</button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
                            <h2 className="text-2xl font-black flex items-center gap-4 text-slate-900">
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                    <Key className="w-6 h-6 text-indigo-500" />
                                </div>
                                Governance & Security
                            </h2>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 group hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="p-4 bg-white rounded-2xl text-slate-400 shadow-sm">
                                            <Bell className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-lg">System Key</p>
                                            <p className="text-sm font-medium text-slate-400 mt-1">Manage your terminal authentication passkey.</p>
                                        </div>
                                    </div>
                                    <button className="px-8 py-4 bg-white border border-slate-200 text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm">Reset</button>
                                </div>
                                <div className="flex items-center justify-between p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 group hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="p-4 bg-white rounded-2xl text-slate-400 shadow-sm">
                                            <Shield className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-lg">Multi-Factor Protocol</p>
                                            <p className="text-sm font-medium text-slate-400 mt-1">Status: <span className="text-amber-500 font-bold uppercase tracking-widest text-xs">Vulnerable</span></p>
                                        </div>
                                    </div>
                                    <button className="px-8 py-4 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">Activate MFA</button>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Regional Settings */}
                    <div className="space-y-10">
                        <section className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl shadow-emerald-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px] -mr-24 -mt-24 transition-all group-hover:bg-emerald-500/20"></div>
                            <h2 className="text-xl font-black mb-8 flex items-center gap-4 relative z-10">
                                <Globe className="w-6 h-6 text-emerald-400" />
                                Localize
                            </h2>
                            <div className="space-y-8 relative z-10">
                                <div className="flex items-center justify-between group/item cursor-pointer">
                                    <span className="text-sm font-bold text-slate-500 group-hover/item:text-white transition-colors">Locale</span>
                                    <span className="text-sm font-black uppercase tracking-widest text-emerald-400">EN-IN</span>
                                </div>
                                <div className="flex items-center justify-between group/item cursor-pointer">
                                    <span className="text-sm font-bold text-slate-500 group-hover/item:text-white transition-colors">Precision</span>
                                    <span className="text-sm font-black uppercase tracking-widest text-emerald-400">UTC +05:30</span>
                                </div>
                                <div className="flex items-center justify-between group/item cursor-pointer">
                                    <span className="text-sm font-bold text-slate-500 group-hover/item:text-white transition-colors">Visual State</span>
                                    <span className="text-sm font-black uppercase tracking-widest text-emerald-400">Emerald Clean</span>
                                </div>
                            </div>
                        </section>

                        <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Termination Protocol</h4>
                            <p className="text-slate-500 text-xs font-medium leading-relaxed mb-8">Initiating a profile shutdown will revoke all HR clearance and notify Corporate Security.</p>
                            <button className="w-full py-5 text-[10px] font-black uppercase tracking-widest text-white bg-slate-900 rounded-2xl hover:bg-rose-600 transition-all shadow-lg hover:shadow-rose-100">Revoke Clearance</button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default HRProfile;
