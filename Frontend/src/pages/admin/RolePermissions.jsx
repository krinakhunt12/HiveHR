import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, Lock, Check, X, Command } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { cn } from '../../lib/utils';

const RolePermissions = () => {
    const roles = [
        {
            name: 'ADMINISTRATOR',
            icon: <ShieldAlert className="w-7 h-7" />,
            description: 'Global system governance, security gates, and role orchestration.',
            permissions: {
                'Add/Edit Users': true,
                'Manage Roles': true,
                'View All Data': true,
                'System Settings': true,
                'Delete Accounts': true,
                'HR Controls': true
            },
            status: 'ROOT_ACCESS'
        },
        {
            name: 'HR_MANAGER',
            icon: <ShieldCheck className="w-7 h-7" />,
            description: 'Personnel life-cycle management, leave gates and audits.',
            permissions: {
                'Add/Edit Users': true,
                'Manage Roles': false,
                'View All Data': true,
                'System Settings': false,
                'Delete Accounts': false,
                'HR Controls': true
            },
            status: 'OPERATIONAL'
        },
        {
            name: 'EMPLOYEE_NODE',
            icon: <Shield className="w-7 h-7" />,
            description: 'Self-service terminal, temporal tracking and personal files.',
            permissions: {
                'Add/Edit Users': false,
                'Manage Roles': false,
                'View All Data': false,
                'System Settings': false,
                'Delete Accounts': false,
                'HR Controls': false
            },
            status: 'LIMITED_GATE'
        }
    ];

    const permissionList = [
        'Add/Edit Users',
        'Manage Roles',
        'View All Data',
        'System Settings',
        'Delete Accounts',
        'HR Controls'
    ];

    return (
        <DashboardLayout>
            <div className="space-y-12 animate-fade-in text-foreground uppercase tracking-widest font-black">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto space-y-4">
                    <div className="inline-block px-4 py-1 border border-foreground text-[10px] font-black mb-4">RBAC_PROTOCOLS</div>
                    <h1 className="text-5xl font-black tracking-tighter">ACCESS_GOVERNANCE</h1>
                    <p className="text-[11px] text-muted-foreground font-bold leading-relaxed normal-case tracking-normal px-12">
                        Role-Based Access Control (RBAC) enforces security by restricting session capabilities to authorized personnel profiles only. Modifications require institutional authorization codes.
                    </p>
                </div>

                {/* Roles Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {roles.map((role) => (
                        <Card key={role.name} className="rounded-none border-foreground/10 bg-background shadow-none hover:border-foreground transition-all group flex flex-col p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div className="w-14 h-14 border border-foreground bg-secondary/50 flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors">
                                    {role.icon}
                                </div>
                                <div className="text-[9px] font-black underline underline-offset-4 decoration-2">{role.status}</div>
                            </div>

                            <h2 className="text-2xl font-black tracking-tighter mb-4">{role.name}</h2>
                            <p className="text-[10px] font-bold text-muted-foreground mb-10 leading-relaxed normal-case h-10">{role.description}</p>

                            <div className="space-y-4 flex-1">
                                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-6">PERMISSION_MATRIX:</p>
                                {permissionList.map(permission => (
                                    <div key={permission} className="flex items-center justify-between py-2 border-b border-foreground/5 group-hover:border-foreground/10">
                                        <span className={cn(
                                            "text-[10px] font-black tracking-widest",
                                            role.permissions[permission] ? "opacity-100" : "opacity-20"
                                        )}>
                                            {permission.toUpperCase().replace(' ', '_')}
                                        </span>
                                        {role.permissions[permission] ? (
                                            <div className="w-4 h-4 bg-foreground flex items-center justify-center">
                                                <Check className="w-3 h-3 text-background stroke-[4]" />
                                            </div>
                                        ) : (
                                            <div className="w-4 h-4 border border-foreground/10 flex items-center justify-center">
                                                <X className="w-3 h-3 text-foreground/20 stroke-[4]" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <Button disabled className="w-full mt-10 h-12 rounded-none bg-secondary/50 text-muted-foreground font-black uppercase tracking-[0.2em] text-[9px] border-none">
                                READ_ONLY_LOG
                            </Button>
                        </Card>
                    ))}
                </div>

                {/* Governance Alert */}
                <Card className="p-10 rounded-none border-2 border-foreground bg-secondary/30 flex flex-col md:flex-row items-center gap-10">
                    <div className="w-20 h-20 bg-foreground flex items-center justify-center shrink-0">
                        <Lock className="w-10 h-10 text-background" />
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-3">
                        <h3 className="text-2xl font-black tracking-tighter uppercase">STRUCTURAL_MODIFICATION_LOCKED</h3>
                        <p className="text-[11px] text-muted-foreground font-bold tracking-tight normal-case leading-relaxed">
                            System schemas and kernel permissions are hard-coded into the protocol for institutional stability. Structural redesign must be initialized via Corporate Infrastructure Bypass.
                        </p>
                    </div>
                    <Button variant="outline" className="h-14 px-8 border-foreground rounded-none font-black uppercase tracking-[0.2em] text-[10px] opacity-40 cursor-not-allowed">
                        REQUEST_OVERRIDE
                    </Button>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default RolePermissions;
