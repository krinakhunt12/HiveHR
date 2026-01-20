import React from 'react';
import {
    Users,
    Clock,
    Calendar,
    CheckCircle,
    TrendingUp,
    AlertCircle,
    BarChart3,
    ArrowRight
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useHRStats } from '../../hooks/api/useHRQueries';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { cn } from '../../lib/utils';

const HRDashboard = () => {
    const { data: hrStats, isLoading } = useHRStats();

    const stats_cards = [
        {
            label: 'Total Workforce',
            value: hrStats?.totalEmployees || 0,
            icon: Users,
            trend: 'Live',
            trendUp: true
        },
        {
            label: 'Present Today',
            value: hrStats?.presentToday || 0,
            icon: CheckCircle,
            trend: 'Live',
            trendUp: true
        },
        {
            label: 'Leave Requests',
            value: hrStats?.pendingLeaves || 0,
            icon: Clock,
            trend: 'Pending',
            trendUp: false
        },
        {
            label: 'Approvals (Mo)',
            value: hrStats?.approvedLeaves || 0,
            icon: Calendar,
            trend: 'Synced',
            trendUp: true
        },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-fade-in text-foreground">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Workforce Intelligence</h1>
                        <p className="text-muted-foreground text-sm mt-1">Operational overview and personnel metrics.</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="px-4 py-2 bg-background border rounded-lg flex items-center gap-2 shadow-sm">
                            <div className="w-1.5 h-1.5 bg-foreground rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Network Active</span>
                        </div>
                    </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats_cards.map((stat, index) => (
                        <Card key={index} className="hover:border-foreground/20 transition-all">
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-2 bg-secondary rounded-md">
                                        <stat.icon className="w-4 h-4 text-foreground" />
                                    </div>
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-full border",
                                        stat.trendUp ? "bg-secondary text-foreground" : "bg-muted text-muted-foreground"
                                    )}>
                                        {stat.trend}
                                    </span>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                                    <p className="text-2xl font-bold tracking-tighter">
                                        {isLoading ? <Skeleton className="h-8 w-16" /> : stat.value}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Placeholder for Pending Leaves or Recent People */}
                    <Card className="lg:col-span-2 border shadow-none">
                        <CardHeader className="flex flex-row items-center justify-between pb-6">
                            <div className="space-y-1">
                                <CardTitle className="text-lg font-bold">Priority Operations</CardTitle>
                                <CardDescription className="text-xs">Tasks requiring immediate HR intervention.</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest">Open Queue</Button>
                        </CardHeader>
                        <CardContent>
                            <div className="py-12 text-center border-2 border-dashed rounded-2xl">
                                <div className="p-3 bg-secondary rounded-full w-fit mx-auto mb-4">
                                    <BarChart3 className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Queue Synchronized</p>
                                <p className="text-[11px] text-muted-foreground/60 mt-1 uppercase tracking-tight">No critical actions pending at this moment.</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Workforce Analysis Card */}
                    <Card className="bg-foreground text-background border-none">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Sentiment Analysis</CardTitle>
                            <CardDescription className="text-background/60 text-xs">Derived from engagement metrics.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8 mt-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-background/40">
                                    <span>Workforce Morale</span>
                                    <span className="text-background">92.4%</span>
                                </div>
                                <div className="h-1 w-full bg-background/10 rounded-full">
                                    <div className="h-full bg-background rounded-full" style={{ width: '92.4%' }}></div>
                                </div>
                            </div>

                            <Card className="bg-background/10 border-none text-background p-4 rounded-xl">
                                <p className="text-[11px] leading-relaxed font-medium">
                                    System insights indicate a significant trend toward <span className="font-bold underline">remote flexibility</span> requests.
                                </p>
                            </Card>

                            <Button variant="secondary" className="w-full h-11 text-[10px] font-black uppercase tracking-widest">
                                Export Intelligence
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default HRDashboard;
