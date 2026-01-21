import React, { useState } from "react";
import { BarChart3, Mail, Lock, ArrowRight, AlertCircle, User, ShieldPlus, Building2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useRegisterCompany } from "../../hooks/api/useCompanyQueries";
import { useToast } from "../../hooks/useToast";
import AppLogger from "../../utils/AppLogger";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

const AdminSignup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const registerMutation = useRegisterCompany();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleSignup = async () => {
        if (!email || !password || !fullName || !companyName) {
            showToast("Please fill in all fields", "error");
            return;
        }

        registerMutation.mutate({
            email,
            password,
            full_name: fullName,
            company_name: companyName
        }, {
            onSuccess: () => {
                showToast("Enterprise initialized. Access granted.", "success");
                navigate("/admin/login");
            },
            onError: (error) => {
                AppLogger.error("Company registration failure", error);
            }
        });
    };

    return (
        <div className="min-h-screen flex bg-background text-foreground uppercase tracking-widest font-black">
            {/* Branding */}
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
                            ADMINISTRATOR_REGISTRATION
                        </div>
                        <h2 className="text-5xl font-black text-white leading-tight">
                            ESTABLISH_GLOBAL_COMMAND
                        </h2>
                        <p className="text-xs text-white/50 leading-loose max-w-sm font-bold normal-case tracking-normal">
                            Initialize your enterprise instance, define operational protocols, and Begin orchestrating your workforce hierarchy.
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="flex-1 flex items-center justify-center p-12 lg:p-24">
                <div className="w-full max-w-sm space-y-12">
                    <div className="space-y-4">
                        <h2 className="text-4xl font-black tracking-tighter">REGISTER_SYSTEM</h2>
                        <p className="text-[10px] text-muted-foreground font-bold">INITIAL_ADMIN_IDENTIFICATION_REQUIRED</p>
                    </div>

                    {registerMutation.isError && (
                        <div className="p-4 bg-muted border border-foreground/10 flex items-center gap-3 text-foreground text-[10px] animate-pulse">
                            <AlertCircle className="w-4 h-4" />
                            <p>{registerMutation.error?.message || "Registration failed"}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground">Enterprise Identity</label>
                            <Input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="ORGANIZATION_NAME"
                                className="h-12 border-foreground/10 bg-muted/50 rounded-none focus-visible:ring-0 focus-visible:border-foreground"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground">Admin Identity Name</label>
                            <Input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="FULL_LEGAL_NAME"
                                className="h-12 border-foreground/10 bg-muted/50 rounded-none focus-visible:ring-0 focus-visible:border-foreground"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground">Operational Email</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ADMIN@ENTERPRISE.COM"
                                className="h-12 border-foreground/10 bg-muted/50 rounded-none focus-visible:ring-0 focus-visible:border-foreground"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground">Secure Passkey</label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="h-12 border-foreground/10 bg-muted/50 rounded-none focus-visible:ring-0 focus-visible:border-foreground"
                            />
                        </div>

                        <Button
                            onClick={handleSignup}
                            disabled={registerMutation.isPending}
                            className="w-full h-14 bg-foreground text-background hover:bg-foreground/90 rounded-none text-xs font-black uppercase tracking-[0.3em] transition-all"
                        >
                            {registerMutation.isPending ? "AUTHORIZING..." : (
                                <span className="flex items-center gap-3">
                                    ESTABLISH_ACCOUNT
                                    <ShieldPlus className="w-4 h-4" />
                                </span>
                            )}
                        </Button>
                    </div>

                    <div className="pt-8 border-t border-muted text-center">
                        <p className="text-[10px] text-muted-foreground font-bold leading-relaxed">
                            ALREADY_AUTHORIZED? {" "}
                            <Link to="/admin/login" className="text-foreground hover:underline underline-offset-4">
                                ACCESS_PORTAL
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSignup;
