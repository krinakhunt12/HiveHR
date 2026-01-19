import React, { useState } from 'react';
import { ShieldCheck, CheckCircle, XCircle, Clock, Users, FileText, BarChart3 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PendingApprovals from '../leaves/PendingApprovals';
import { useLeaves } from '../../hooks/useLeaves';
import { usePeople } from '../../hooks/usePeople';

const HRDashboard = () => {
    const [activeTab, setActiveTab] = useState('approvals');
    const { leaves } = useLeaves();
    const { employees } = usePeople();

    const stats = [
        { label: 'Pending Leaves', value: leaves.filter(l => l.status === 'pending').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Total Employees', value: employees?.length || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Approved Today', value: leaves.filter(l => l.status === 'approved' && new Date(l.updated_at).toDateString() === new Date().toDateString()).length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    ];

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-8 space-y-8 bg-slate-50 min-h-screen">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <ShieldCheck className="w-8 h-8 text-slate-800" />
                            <h1 className="text-3xl font-bold text-slate-900">HR Command Center</h1>
                        </div>
                        <p className="text-slate-600">Review approvals, manage workforce, and track HR metrics.</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${stat.bg}`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="border-b border-slate-200 bg-slate-50/50">
                        <nav className="flex items-center">
                            <button
                                onClick={() => setActiveTab('approvals')}
                                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all border-b-2 ${activeTab === 'approvals'
                                        ? 'border-slate-800 text-slate-800 bg-white'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
                                    }`}
                            >
                                <Clock className="w-4 h-4" />
                                Leave Approvals
                            </button>
                            <button
                                onClick={() => setActiveTab('analytics')}
                                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all border-b-2 ${activeTab === 'analytics'
                                        ? 'border-slate-800 text-slate-800 bg-white'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
                                    }`}
                            >
                                <BarChart3 className="w-4 h-4" />
                                Workforce Analytics
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === 'approvals' ? (
                            <PendingApprovals />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                    <BarChart3 className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Advanced Analytics Coming Soon</h3>
                                <p className="text-slate-500 max-w-sm mx-auto mt-2">
                                    We're building powerful data visualizations to help you understand workforce trends better.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default HRDashboard;
