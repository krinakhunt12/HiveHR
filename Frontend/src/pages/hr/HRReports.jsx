import React from 'react';
import {
    FileText,
    Download,
    BarChart3,
    PieChart as PieChartIcon,
    Users,
    TrendingUp,
    Files,
    Command
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';

const HRReports = () => {
    const reportCategories = [
        {
            title: 'WORKFORCE_ANALYTICS',
            desc: 'Personnel distribution, churn rates, and demographic breakdowns.',
            icon: Users,
            reports: ['Organization_Ledger', 'Headcount_Report', 'Diversity_Matrix']
        },
        {
            title: 'ATTENDANCE_INTEL',
            desc: 'Temporal logs, overtime reports, and late-arrival patterns.',
            icon: BarChart3,
            reports: ['Monthly_Summary', 'Clock-in_Logs_Audit', 'Overtime_Ledger']
        },
        {
            title: 'LEAVE_PROTECT',
            desc: 'Balance summaries, sick leave trends, and utilization metrics.',
            icon: Files,
            reports: ['Cycle_Utilization', 'Absence_Patterns', 'Balance_Export']
        }
    ];

    return (
        <DashboardLayout>
            <div className="space-y-12 animate-fade-in text-foreground uppercase tracking-widest font-black">
                {/* Header */}
                <div className="relative h-48 w-full bg-foreground flex items-center justify-center border-b border-white/5 overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="flex flex-wrap h-full w-full">
                            {Array(100).fill(0).map((_, i) => (
                                <div key={i} className="w-10 h-10 border-[0.5px] border-background"></div>
                            ))}
                        </div>
                    </div>
                    <div className="relative z-10 text-center space-y-2">
                        <h1 className="text-4xl font-black text-background tracking-[0.3em]">REPORT_VAULT</h1>
                        <p className="text-[9px] text-background/50 font-bold tracking-[0.5em]">SYSTEM_DATA_EXPORTS</p>
                    </div>
                </div>

                {/* Categories */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {reportCategories.map((cat, i) => (
                        <Card key={i} className="rounded-none border-foreground/10 bg-background shadow-none hover:border-foreground transition-all group p-10 flex flex-col">
                            <div className="w-14 h-14 bg-foreground text-background flex items-center justify-center mb-10 group-hover:invert transition-all">
                                <cat.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black mb-4 tracking-tighter">{cat.title}</h3>
                            <p className="text-[10px] font-bold text-muted-foreground mb-10 leading-relaxed lowercase tracking-normal">
                                {cat.desc}
                            </p>

                            <div className="flex-1 space-y-3">
                                <p className="text-[8px] font-black text-muted-foreground mb-4 tracking-[0.3em]">SELECT_FILE:</p>
                                {cat.reports.map(report => (
                                    <button
                                        key={report}
                                        className="w-full flex items-center justify-between p-4 border border-foreground/5 bg-secondary/20 hover:bg-foreground hover:text-background transition-all group/btn"
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-widest">{report}</span>
                                        <Download className="w-3.5 h-3.5 opacity-30 group-hover/btn:opacity-100" />
                                    </button>
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Bottom Action */}
                <div className="p-12 border-2 border-foreground bg-foreground text-background flex flex-col lg:flex-row items-center justify-between gap-10 rounded-none shadow-[20px_20px_0px_0px_rgba(0,0,0,0.1)]">
                    <div className="space-y-4 text-center lg:text-left">
                        <div className="inline-block px-3 py-1 bg-background text-foreground text-[9px] font-black mb-2">CUSTOM_EXTRACTION</div>
                        <h2 className="text-3xl font-black tracking-tighter">INITIATE_SQL_QUERY?</h2>
                        <p className="text-[11px] text-background/60 font-medium max-w-lg leading-loose normal-case tracking-normal">
                            Unmatched metrics in current files can be addressed through the institutional query builder. Request specific workforce data structures via manual override.
                        </p>
                    </div>
                    <Button variant="outline" className="h-16 px-12 bg-background text-foreground hover:invert rounded-none font-black uppercase tracking-[0.3em] text-[11px] transition-all flex items-center gap-4">
                        <TrendingUp className="w-4 h-4" />
                        ACCESS_BUILDER
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default HRReports;
