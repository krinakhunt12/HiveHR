import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Key, Bell, Globe, Camera, Save, Loader2, Command, Lock } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import { useToast } from '../../hooks/useToast';
import AppLogger from '../../utils/AppLogger';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { cn } from '../../lib/utils';

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
            showToast('Identity records updated.', 'success');
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
            <div className="max-w-5xl mx-auto space-y-12 animate-fade-in text-foreground uppercase tracking-widest font-black">
                {/* Visual Header */}
                <div className="relative h-64 w-full bg-foreground flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="grid grid-cols-10 h-full w-full">
                            {Array(100).fill(0).map((_, i) => (
                                <div key={i} className="border-[0.5px] border-background"></div>
                            ))}
                        </div>
                    </div>
                    <div className="relative z-10 text-center space-y-4">
                        <h1 className="text-6xl font-black text-background tracking-[0.2em]">ADMIN_STATION</h1>
                        <p className="text-[10px] text-background/50 font-bold tracking-[0.5em]">SYSTEM_IDENTITY_MANAGEMENT</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 -mt-24 relative z-20 px-4 md:px-0">
                    {/* Identity Module */}
                    <div className="lg:col-span-2 space-y-12">
                        <Card className="rounded-none border-foreground shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] bg-background">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b pb-8">
                                <div className="space-y-1">
                                    <CardTitle className="text-2xl font-black">IDENTITY_CORE</CardTitle>
                                    <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground">Primary personnel recognition markers.</CardDescription>
                                </div>
                                <Button
                                    variant={isEditing ? "default" : "outline"}
                                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                    disabled={loading}
                                    className="h-10 px-6 rounded-none text-[10px] uppercase font-black tracking-widest border-foreground"
                                >
                                    {loading ? "SAVING..." : (isEditing ? "CONFIRM_CHANGES" : "MODIFY_IDENTITY")}
                                </Button>
                            </CardHeader>
                            <CardContent className="pt-10 space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground">Legal Signature Name</label>
                                        <Input
                                            readOnly={!isEditing}
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className={cn(
                                                "h-14 rounded-none border-foreground/10 bg-secondary/30 font-black uppercase tracking-widest text-xs px-6",
                                                isEditing && "border-foreground bg-background focus-visible:ring-0"
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground">Personnel Serial ID</label>
                                        <Input
                                            readOnly
                                            value={profile?.employee_id || 'U_GEN_000'}
                                            className="h-14 rounded-none border-foreground/5 bg-secondary text-muted-foreground font-black uppercase tracking-widest text-xs px-6 cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-3">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground">Global Comms Address</label>
                                        <div className="flex gap-2">
                                            <Input readOnly value={profile?.email || ''} className="h-14 rounded-none border-foreground/5 bg-secondary text-muted-foreground font-black uppercase tracking-widest text-xs px-6 cursor-not-allowed flex-1" />
                                            <Button variant="outline" className="h-14 rounded-none h-14 px-6 border-foreground/10 opacity-30 cursor-not-allowed text-[10px]">VERIFIED</Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-none border-foreground shadow-none bg-background">
                            <CardHeader className="border-b">
                                <CardTitle className="text-xl font-black">SECURITY_PROTOCOLS</CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground">Access control and verification settings.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-8 space-y-4">
                                <div className="flex items-center justify-between p-6 border border-foreground/5 bg-secondary/20">
                                    <div className="flex items-center gap-6">
                                        <Lock className="w-5 h-5" />
                                        <div>
                                            <p className="text-xs font-black uppercase">Master Passkey</p>
                                            <p className="text-[9px] font-bold text-muted-foreground mt-1 lowercase">update your access credentials across all gates.</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="h-10 rounded-none text-[9px] font-black border-foreground/20 uppercase tracking-widest">Update</Button>
                                </div>
                                <div className="flex items-center justify-between p-6 border border-foreground/5 bg-secondary/20">
                                    <div className="flex items-center gap-6">
                                        <Shield className="w-5 h-5" />
                                        <div>
                                            <p className="text-xs font-black uppercase">Multi-Gate Auth (2FA)</p>
                                            <p className="text-[9px] font-bold text-muted-foreground mt-1 lowercase">Currently DISABLED for this station.</p>
                                        </div>
                                    </div>
                                    <Button className="h-10 rounded-none bg-foreground text-background text-[9px] font-black uppercase tracking-widest hover:invert">Enable</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Meta Module */}
                    <div className="space-y-12">
                        <Card className="rounded-none border-foreground bg-foreground text-background shadow-none">
                            <CardHeader>
                                <CardTitle className="text-lg font-black tracking-tighter">LOCAL_PREFERENCES</CardTitle>
                                <CardDescription className="text-background/40 text-[10px] font-bold uppercase">UI/UX interface variables.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8 pt-4">
                                <div className="flex items-center justify-between border-b border-background/10 pb-4">
                                    <span className="text-[10px] font-bold text-background/50">DIALECT</span>
                                    <span className="text-[10px] font-black tracking-widest underline decoration-2 underline-offset-4">ENGLISH_US</span>
                                </div>
                                <div className="flex items-center justify-between border-b border-background/10 pb-4">
                                    <span className="text-[10px] font-bold text-background/50">TIME_ORBIT</span>
                                    <span className="text-[10px] font-black tracking-widest underline decoration-2 underline-offset-4">GMT+5.30</span>
                                </div>
                                <div className="flex items-center justify-between border-b border-background/10 pb-4">
                                    <span className="text-[10px] font-bold text-background/50">VISUAL_MODE</span>
                                    <span className="text-[10px] font-black tracking-widest underline decoration-2 underline-offset-4">MINIMALIST_B&W</span>
                                </div>
                                <Button variant="secondary" className="w-full h-12 rounded-none bg-background text-foreground text-[10px] font-black uppercase tracking-widest">RESET_PREF</Button>
                            </CardContent>
                        </Card>

                        <div className="p-10 border-2 border-foreground/10 rounded-none space-y-6">
                            <h4 className="font-black text-[11px] uppercase tracking-[0.3em] text-foreground underline decoration-double underline-offset-4">DANGER_ZONE_CORE</h4>
                            <p className="text-muted-foreground text-[10px] font-bold leading-loose normal-case">Initializing a core shutdown will terminate all administrative tokens and lock global system gates. Action is irreversible without manual root bypass.</p>
                            <Button variant="ghost" className="w-full h-12 rounded-none border border-red-600 text-red-600 hover:bg-red-600 hover:text-white text-[10px] font-black uppercase tracking-widest">
                                SHUTDOWN_ACCESS_NODE
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminProfile;
