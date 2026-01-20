import React, { useState } from 'react';
import {
    Search,
    Filter,
    Download,
    Clock,
    Calendar as CalendarIcon,
    User,
    MoreHorizontal,
    CheckCircle2,
    XCircle,
    Command
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAttendanceQuery } from '../../hooks/api/useAttendanceQueries';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/skeleton';
import { cn } from '../../lib/utils';

const HRAttendanceManagement = () => {
    const { data: logs, isLoading } = useAttendanceQuery();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLogs = logs?.filter(log =>
        log.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.profiles?.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-fade-in text-foreground uppercase tracking-widest font-black">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black tracking-tighter uppercase underline decoration-4 underline-offset-8">Attendance_Ledger</h1>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-4">Biometric authentication log & duration tracking.</p>
                    </div>
                    <Button variant="outline" className="h-12 px-6 rounded-none border-foreground text-[10px] uppercase font-black tracking-widest hover:bg-foreground hover:text-background transition-all">
                        <Download className="w-4 h-4 mr-2" />
                        EXPORT_CSV_DATA
                    </Button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-2 relative">
                        <Command className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="SEARCH_PERSONNEL..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 h-14 rounded-none border-foreground/10 bg-secondary/30 font-black uppercase tracking-[0.2em] text-[10px] focus-visible:ring-0 focus-visible:border-foreground"
                        />
                    </div>
                    <Button variant="outline" className="h-14 rounded-none border-foreground/10 bg-secondary/10 text-[10px] font-black uppercase tracking-widest">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        CYCLE:THIS_WEEK
                    </Button>
                    <Button variant="outline" className="h-14 rounded-none border-foreground/10 bg-secondary/10 text-[10px] font-black uppercase tracking-widest">
                        <Filter className="w-4 h-4 mr-2" />
                        STATUS:ALL
                    </Button>
                </div>

                {/* Table */}
                <Card className="rounded-none border-foreground/10 shadow-none overflow-hidden">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-secondary/50 border-b border-foreground/10">
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Personnel_Identity</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">DATE_STAMP</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">PUNCH_IN</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">PUNCH_OUT</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">DURATION</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">STATE_CODE</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-foreground/5">
                                    {isLoading ? (
                                        Array(8).fill(0).map((_, i) => (
                                            <tr key={i}>
                                                <td className="px-8 py-6"><Skeleton className="h-4 w-48" /></td>
                                                <td className="px-8 py-6"><Skeleton className="h-4 w-24" /></td>
                                                <td className="px-8 py-6"><Skeleton className="h-4 w-16" /></td>
                                                <td className="px-8 py-6"><Skeleton className="h-4 w-16" /></td>
                                                <td className="px-8 py-6"><Skeleton className="h-4 w-12" /></td>
                                                <td className="px-8 py-6 text-right"><Skeleton className="h-6 w-24 ml-auto rounded-full" /></td>
                                            </tr>
                                        ))
                                    ) : filteredLogs.length === 0 ? (
                                        <tr><td colSpan="6" className="text-center py-24 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">SYSTEM_EMPTY:NO_LOGS_FOUND</td></tr>
                                    ) : filteredLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-secondary/30 transition-colors group border-b border-foreground/5">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-9 h-9 rounded-none bg-foreground text-background flex items-center justify-center font-black text-xs">
                                                        {log.profiles?.full_name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-xs uppercase tracking-tighter leading-none">{log.profiles?.full_name}</p>
                                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5">{log.profiles?.employee_id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 font-black text-xs opacity-70 tracking-tight">{log.date}</td>
                                            <td className="px-8 py-6 text-xs font-black tracking-widest">{log.check_in || 'N_A'}</td>
                                            <td className="px-8 py-6 text-xs font-black tracking-widest">{log.check_out || 'PND'}</td>
                                            <td className="px-8 py-6">
                                                <span className="bg-secondary px-3 py-1 font-black text-[9px] border border-foreground/5">{log.total_hours || '0.0'}H</span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end">
                                                    {log.check_out ? (
                                                        <span className="flex items-center gap-2 px-3 py-1.5 border border-foreground/10 bg-secondary/50 text-[9px] font-black uppercase tracking-widest">
                                                            <div className="w-1 h-1 bg-black rounded-full" />
                                                            FINALIZED
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-2 px-3 py-1.5 border border-foreground bg-foreground text-background text-[9px] font-black uppercase tracking-widest animate-pulse">
                                                            <Clock className="w-3 h-3" />
                                                            ACTIVE_SESS
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default HRAttendanceManagement;
