import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Key, Bell, Globe, Camera, Briefcase, Command, Save, Lock } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useCurrentUser } from '../../hooks/api/useAuthQueries';
import { useUpdateEmployee } from '../../hooks/api/useEmployeeQueries';

const HRProfile = () => {
    const { data: currentUserData } = useCurrentUser();
    const updateEmployeeMutation = useUpdateEmployee();
    const { showToast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');

    const profile = currentUserData?.data?.profile;

    useEffect(() => {
        if (profile) setName(profile.full_name);
    }, [profile]);

    const handleSave = () => {
        if (!profile?.id) return;

        updateEmployeeMutation.mutate({
            id: profile.id,
            updates: { full_name: name }
        }, {
            onSuccess: () => {
                showToast('Identity records updated.', 'success');
                setIsEditing(false);
            },
            onError: (error) => {
                AppLogger.error('HR profile update failure', error);
                // Error toast handled globally or here if customized
            }
        });
    };

    const loading = updateEmployeeMutation.isPending;

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-12 animate-fade-in text-foreground uppercase tracking-widest font-black">
                {/* Visual Header */}
                <div className="relative h-64 w-full bg-foreground flex items-center justify-center overflow-hidden border-b border-white/5">
                    <div className="absolute inset-0 opacity-5">
                        <div className="flex flex-wrap h-full w-full">
                            {Array(200).fill(0).map((_, i) => (
                                <div key={i} className="w-10 h-10 border-[0.2px] border-background"></div>
                            ))}
                        </div>
                    </div>
                    <div className="relative z-10 text-center space-y-4">
                        <h1 className="text-6xl font-black text-background tracking-[0.2em] uppercase">HR_STATION</h1>
                        <p className="text-[10px] text-background/50 font-bold tracking-[0.5em] uppercase">PERSONNEL_DATA_ADMINISTRATION</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 -mt-24 relative z-20 px-4 md:px-0">
                    {/* Identity Module */}
                    <div className="lg:col-span-2 space-y-12">
                        <Card className="rounded-none border-foreground shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] bg-background">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b pb-8">
                                <div className="space-y-1">
                                    <CardTitle className="text-2xl font-black uppercase">Identity_Markers</CardTitle>
                                    <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground">Primary recognition codes for HR personnel.</CardDescription>
                                </div>
                                <Button
                                    variant={isEditing ? "default" : "outline"}
                                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                    disabled={loading}
                                    className="h-10 px-6 rounded-none text-[10px] uppercase font-black tracking-widest border-foreground"
                                >
                                    {loading ? "COMMITTING..." : (isEditing ? "CONFIRM_SIG" : "REVISE_PROFILE")}
                                </Button>
                            </CardHeader>
                            <CardContent className="pt-10 space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground">Full Legal Identification</label>
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
                                        <label className="text-[10px] font-black uppercase text-muted-foreground">Operational STAFF ID</label>
                                        <Input
                                            readOnly
                                            value={profile?.employee_id || 'HR_SEC_000'}
                                            className="h-14 rounded-none border-foreground/5 bg-secondary text-muted-foreground font-black uppercase tracking-widest text-xs px-6 cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-3">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground">Corporate Comms Terminal</label>
                                        <div className="flex gap-2">
                                            <Input readOnly value={profile?.email || ''} className="h-14 rounded-none border-foreground/5 bg-secondary text-muted-foreground font-black uppercase tracking-widest text-xs px-6 cursor-not-allowed flex-1" />
                                            <Button variant="outline" className="h-14 rounded-none h-14 px-6 border-foreground/10 opacity-30 cursor-not-allowed text-[10px]">AUTH_SYNC</Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-none border-foreground shadow-none bg-background">
                            <CardHeader className="border-b">
                                <CardTitle className="text-xl font-black uppercase">Gate_Security</CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground">Personnel access and authentication protocols.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-8 space-y-4">
                                <div className="flex items-center justify-between p-6 border border-foreground/5 bg-secondary/20">
                                    <div className="flex items-center gap-6">
                                        <Lock className="w-5 h-5 opacity-40" />
                                        <div>
                                            <p className="text-xs font-black uppercase">STATION_PASSKEY</p>
                                            <p className="text-[9px] font-bold text-muted-foreground mt-1 lowercase">Manage personnel terminal authentication keys.</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="h-10 rounded-none text-[9px] font-black border-foreground/20 uppercase tracking-widest">Update</Button>
                                </div>
                                <div className="flex items-center justify-between p-6 border border-foreground/5 bg-secondary/20">
                                    <div className="flex items-center gap-6">
                                        <Shield className="w-5 h-5 opacity-40" />
                                        <div>
                                            <p className="text-xs font-black uppercase">MFA_ENFORCEMENT</p>
                                            <p className="text-[9px] font-bold text-muted-foreground mt-1 lowercase">Standard institutional verification protocol.</p>
                                        </div>
                                    </div>
                                    <Button className="h-10 rounded-none bg-foreground text-background text-[9px] font-black uppercase tracking-widest hover:invert">Activate</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Regional Module */}
                    <div className="space-y-12">
                        <Card className="rounded-none border-foreground bg-foreground text-background shadow-none">
                            <CardHeader>
                                <CardTitle className="text-lg font-black tracking-tighter uppercase">STATION_VARS</CardTitle>
                                <CardDescription className="text-background/40 text-[10px] font-bold uppercase">Localized terminal parameters.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8 pt-4">
                                <div className="flex items-center justify-between border-b border-background/10 pb-4 text-[10px]">
                                    <span className="font-bold text-background/50">DIALECT_SET</span>
                                    <span className="font-black tracking-widest underline underline-offset-4">EN_IN</span>
                                </div>
                                <div className="flex items-center justify-between border-b border-background/10 pb-4 text-[10px]">
                                    <span className="font-bold text-background/50">CHRONO_UNIT</span>
                                    <span className="font-black tracking-widest underline underline-offset-4">UTC_+5.30</span>
                                </div>
                                <div className="flex items-center justify-between border-b border-background/10 pb-4 text-[10px]">
                                    <span className="font-bold text-background/50">OS_THEME</span>
                                    <span className="font-black tracking-widest underline underline-offset-4">PURE_MINIMAL</span>
                                </div>
                                <Button variant="secondary" className="w-full h-12 rounded-none bg-background text-foreground text-[10px] font-black uppercase tracking-widest">SYNC_PREF</Button>
                            </CardContent>
                        </Card>

                        <div className="p-10 border-2 border-foreground/10 rounded-none space-y-6">
                            <h4 className="font-black text-[11px] uppercase tracking-[0.3em] text-foreground underline decoration-double underline-offset-4">TERMINATION_GATE</h4>
                            <p className="text-muted-foreground text-[10px] font-bold leading-loose normal-case">Initializing a profile revocation will terminate all HR clearance tokens and notify institutional security. Action is audited.</p>
                            <Button variant="ghost" className="w-full h-12 rounded-none border border-red-600 text-red-600 hover:bg-red-600 hover:text-white text-[10px] font-black uppercase tracking-widest">
                                REVOKE_STATION_ACCESS
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default HRProfile;
