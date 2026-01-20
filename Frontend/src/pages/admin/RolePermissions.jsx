import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, Lock, Check, X } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';

const RolePermissions = () => {
    const roles = [
        {
            name: 'Administrator',
            icon: <ShieldAlert className="w-8 h-8 text-rose-500" />,
            description: 'Full system governance, security controls, and role management.',
            permissions: {
                'Add/Edit Users': true,
                'Manage Roles': true,
                'View All Data': true,
                'System Settings': true,
                'Delete Accounts': true,
                'HR Controls': true
            },
            color: 'border-rose-100 bg-rose-50/30'
        },
        {
            name: 'HR Manager',
            icon: <ShieldCheck className="w-8 h-8 text-emerald-500" />,
            description: 'Workforce management, leave approvals, and employee records.',
            permissions: {
                'Add/Edit Users': true,
                'Manage Roles': false,
                'View All Data': true,
                'System Settings': false,
                'Delete Accounts': false,
                'HR Controls': true
            },
            color: 'border-emerald-100 bg-emerald-50/30'
        },
        {
            name: 'Employee',
            icon: <Shield className="w-8 h-8 text-indigo-500" />,
            description: 'Self-service dashboard, attendance tracking, and personal files.',
            permissions: {
                'Add/Edit Users': false,
                'Manage Roles': false,
                'View All Data': false,
                'System Settings': false,
                'Delete Accounts': false,
                'HR Controls': false
            },
            color: 'border-indigo-100 bg-indigo-50/30'
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
            <div className="space-y-10">
                <div className="text-center max-w-2xl mx-auto">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">RBAC Control Center</h1>
                    <p className="text-lg text-slate-500 font-medium leading-relaxed">
                        Role-Based Access Control (RBAC) ensures that only authorized personnel can access sensitive system functions.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {roles.map((role) => (
                        <div key={role.name} className={`rounded-3xl border-2 p-8 transition-all hover:shadow-2xl hover:shadow-slate-200/50 ${role.color}`}>
                            <div className="mb-6 p-4 bg-white rounded-2xl shadow-sm inline-block">
                                {role.icon}
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 mb-2">{role.name}</h2>
                            <p className="text-sm font-medium text-slate-500 mb-8 h-10">{role.description}</p>

                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Permissions Matrix</p>
                                {permissionList.map(permission => (
                                    <div key={permission} className="flex items-center justify-between group">
                                        <span className={`text-sm font-bold ${role.permissions[permission] ? 'text-slate-700' : 'text-slate-400'}`}>
                                            {permission}
                                        </span>
                                        {role.permissions[permission] ? (
                                            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                                                <Check className="w-3.5 h-3.5 text-white stroke-[4]" />
                                            </div>
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                                                <X className="w-3.5 h-3.5 text-slate-400 stroke-[4]" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button className="w-full mt-10 py-4 rounded-2xl bg-white border border-slate-200 text-slate-400 font-black uppercase tracking-widest text-[10px] cursor-not-allowed">
                                Read Only Access
                            </button>
                        </div>
                    ))}
                </div>

                <div className="p-8 bg-indigo-600 rounded-3xl text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-indigo-200">
                    <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                        <Lock className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-2xl font-bold mb-2">Need to modify role schemas?</h3>
                        <p className="text-indigo-100 font-medium">System policies are currently locked at the kernel level for security. Contact Corporate Infrastructure to request structural changes.</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default RolePermissions;
