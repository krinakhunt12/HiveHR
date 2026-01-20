import React, { useState } from "react";
import { BarChart3, Mail, Lock, ArrowRight, AlertCircle, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSupabaseAuth } from "../../hooks/useSupabaseAuth";
import { useToast } from "../../hooks/useToast";
import AppLogger from "../../utils/AppLogger";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

const EmployeeLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login, loading: isLoading, error: authError } = useSupabaseAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const result = await login(email, password);
            if (!result.profile) {
                showToast("Account profile initialization pending.", "error");
                return;
            }
            showToast("Employee workspace loaded.", "success");
            navigate("/employee/dashboard");
        } catch (err) {
            AppLogger.error("Employee portal access failure", err);
            showToast(err.message || "Authorization failed", "error");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className="min-h-screen flex bg-background text-foreground uppercase tracking-widest font-black">
            {/* Minimalist branding side */}
            <div className="hidden lg:flex lg:w-1/2 bg-black p-16 flex-col justify-between border-r border-white/10">
                <div>
                    <div className="flex items-center gap-4 mb-24">
                        <div className="w-10 h-10 bg-white rounded-sm flex items-center justify-center">
                            <BarChart3 className="text-black w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tighter uppercase">HiveHR</h1>
                    </div>

                    <div className="space-y-10">
                        <div className="text-[10px] px-3 py-1 bg-white text-black inline-block">
                            EMPLOYEE_SELF_SERVICE
                        </div>
                        <h2 className="text-5xl font-black text-white leading-tight uppercase">
                            PERSONNEL_RESOURCE_HUB
                        </h2>
                        <p className="text-xs text-white/50 leading-loose max-w-sm font-bold normal-case tracking-normal">
                            Monitor personal development cycles, submit operational leave data, and Synchronize with enterprise objectives.
                        </p>
                    </div>
                </div>

                <div>
                    <p className="text-white/20 text-[10px]">
                        HIVEHR_ENGINE.BUILD_V2.SECTOR_EMP.
                    </p>
                </div>
            </div>

            {/* Login form side */}
            <div className="flex-1 flex items-center justify-center p-12 lg:p-24">
                <div className="w-full max-w-sm space-y-12">
                    <div className="space-y-4">
                        <h2 className="text-4xl font-black tracking-tighter uppercase">Portal_Access</h2>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase">Authorized_Personnel_Identification</p>
                    </div>

                    {authError && (
                        <div className="p-4 bg-muted border border-foreground/10 flex items-center gap-3 text-foreground text-[10px] animate-fade-in">
                            <AlertCircle className="w-4 h-4" />
                            <p>{authError}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground">Internal Email</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="USER@ORGANIZATION.GRID"
                                className="h-12 border-foreground/10 bg-muted/50 rounded-none focus-visible:ring-0 focus-visible:border-foreground"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground">Standard Passkey</label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="••••••••"
                                className="h-12 border-foreground/10 bg-muted/50 rounded-none focus-visible:ring-0 focus-visible:border-foreground"
                            />
                        </div>

                        <Button
                            onClick={handleLogin}
                            disabled={isLoading}
                            className="w-full h-14 bg-foreground text-background hover:bg-foreground/90 rounded-none text-xs font-black uppercase tracking-[0.3em] transition-all"
                        >
                            {isLoading ? "LOADING_SESSION..." : (
                                <span className="flex items-center gap-3">
                                    INITIATE_WORKSTATION
                                    <LogIn className="w-4 h-4" />
                                </span>
                            )}
                        </Button>
                    </div>

                    <div className="pt-8 border-t border-muted text-center">
                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest leading-relaxed">
                            Secured via Enterprise Encryption Protocol. Unauthorized access logged.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeLogin;
