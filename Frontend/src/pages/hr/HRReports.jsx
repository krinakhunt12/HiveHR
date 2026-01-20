import React from 'react';
import {
    FileText,
    Download,
    BarChart3,
    PieChart as PieChartIcon,
    Users,
    TrendingUp,
    Files
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';

const HRReports = () => {
    const reportCategories = [
        {
            title: 'Workforce Analytics',
            desc: 'Employee distribution, turnover rates, and demographic breakdowns.',
            icon: Users,
            color: 'bg-indigo-50 text-indigo-600',
            reports: ['Organization Chart', 'Headcount Report', 'Diversity Matrix']
        },
        {
            title: 'Attendance Intelligence',
            desc: 'Daily logs, overtime reports, and late-arrival patterns.',
            icon: BarChart3,
            color: 'bg-emerald-50 text-emerald-600',
            reports: ['Monthly Summary', 'Clock-in Logs', 'Overtime Audit']
        },
        {
            title: 'Leave & Absence',
            desc: 'Leave utilization, sick leave trends, and balance summaries.',
            icon: Files,
            color: 'bg-rose-50 text-rose-600',
            reports: ['Utilization Report', 'Absence Trends', 'Balance Export']
        }
    ];

    return (
        <DashboardLayout>
            <div className="space-y-10 animate-in fade-in duration-500">
                <div className="text-center max-w-2xl mx-auto space-y-4">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Reporting Vault</h1>
                    <p className="text-lg text-slate-500 font-medium leading-relaxed">
                        Generate and download mission-critical data exports for workforce planning and compliance auditing.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {reportCategories.map((cat, i) => (
                        <div key={i} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 flex flex-col group hover:shadow-2xl hover:shadow-slate-200/50 transition-all">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 ${cat.color} group-hover:scale-110 transition-transform`}>
                                <cat.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">{cat.title}</h3>
                            <p className="text-sm font-medium text-slate-400 mb-8">{cat.desc}</p>

                            <div className="flex-1 space-y-3">
                                {cat.reports.map(report => (
                                    <button key={report} className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all group/btn">
                                        <span className="text-sm font-bold text-slate-600 group-hover/btn:text-slate-900">{report}</span>
                                        <Download className="w-4 h-4 text-slate-300 group-hover/btn:text-indigo-500" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-10 bg-slate-900 rounded-[3rem] text-white flex flex-col lg:flex-row items-center justify-between gap-10 shadow-2xl shadow-indigo-200">
                    <div className="space-y-4 text-center lg:text-left">
                        <h2 className="text-3xl font-black">Ready for a Custom Extraction?</h2>
                        <p className="text-slate-400 font-medium max-w-lg">
                            Can't find the specific metric you need? Use our advanced query builder to construct a tailored workforce report.
                        </p>
                    </div>
                    <button className="px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-900/50 flex items-center gap-3">
                        <TrendingUp className="w-5 h-5" />
                        Initialize Query Builder
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default HRReports;
