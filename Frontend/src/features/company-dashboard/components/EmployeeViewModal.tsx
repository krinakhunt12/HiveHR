import React from 'react';
import { Dialog } from '@/shared/ui/dialog';
import type { Employee } from '@/shared/api/hooks/hrHooks';
import {
    User,
    Briefcase,
    Hash,
    Shield,
    Mail,
    Phone,
    Calendar,
    Building2,
    Clock,
    CircleDot,
    UserCheck,
    Globe,
    Zap
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Badge } from '@/shared/ui/badge';

interface EmployeeViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: Employee | null;
}

const statusConfig: Record<string, { label: string; variant: "outline"; className: string }> = {
    active: { label: 'Active', variant: "outline", className: 'bg-success/5 text-success border-success/20' },
    inactive: { label: 'Inactive', variant: "outline", className: 'bg-muted text-textSecondary border-border/40' },
    probation: { label: 'Probation', variant: "outline", className: 'bg-warning/5 text-warning border-warning/20' },
};

const employmentTypeLabel: Record<string, string> = {
    full_time: 'Full-time',
    part_time: 'Part-time',
    contract: 'Contract',
};

const workLocationLabel: Record<string, string> = {
    office: 'On-site / Office',
    remote: 'Remote',
    hybrid: 'Hybrid',
};

interface InfoRowProps {
    icon: React.ReactNode;
    label: string;
    value: string | null | undefined;
    mono?: boolean;
}

const InfoRow = ({ icon, label, value, mono }: InfoRowProps) => (
    <div className="flex items-start gap-5 py-4 border-b border-border/20 last:border-0 group/row">
        <div className="w-9 h-9 rounded-xl bg-surface border border-border/40 flex items-center justify-center flex-shrink-0 mt-0.5 text-textSecondary group-hover/row:text-primary group-hover/row:border-primary/20 transition-all">
            {React.cloneElement(icon as React.ReactElement, { size: 16 })}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-textSecondary uppercase tracking-[0.2em] mb-1.5">{label}</p>
            <p className={cn(
                'text-sm font-bold text-textPrimary truncate transition-colors group-hover/row:text-primary',
                mono && 'font-mono tracking-tight',
                !value && 'text-textSecondary/40 italic font-medium'
            )}>
                {value || 'Operational data missing'}
            </p>
        </div>
    </div>
);

export const EmployeeViewModal = ({ isOpen, onClose, employee }: EmployeeViewModalProps) => {
    if (!employee) return null;

    const designation = (employee as any).designation_name ?? employee.designation ?? '—';
    const status = statusConfig[employee.status] ?? statusConfig.inactive;
    const empType = employmentTypeLabel[employee.employment_type] ?? employee.employment_type ?? '—';
    const workLoc = workLocationLabel[(employee as any).work_location ?? ''] ?? (employee as any).work_location ?? '—';
    const joinDate = (employee as any).date_of_joining ?? (employee as any).joined_on ?? null;
    const formattedJoin = joinDate
        ? new Date(joinDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
        : null;

    const initials = (employee.full_name || 'U')
        .split(' ')
        .map((n: string) => n?.[0] || '')
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Member Telemetry" className="max-w-2xl">
            <div className="flex items-center gap-8 mb-10 pb-10 border-b border-border/20 text-left">
                <div className="w-24 h-24 rounded-[2rem] bg-surface border-2 border-border/40 flex items-center justify-center flex-shrink-0 shadow-inner group/avatar">
                    <span className="text-3xl font-bold text-primary tracking-tighter group-hover:scale-110 transition-transform">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-textPrimary tracking-tight truncate">{employee.full_name}</h2>
                        <Badge 
                            variant={status.variant}
                            className={cn("px-3 py-1 rounded-full font-bold uppercase tracking-widest text-[9px] shadow-none", status.className)}
                        >
                            {status.label}
                        </Badge>
                    </div>
                    <p className="text-sm font-bold text-primary/80 uppercase tracking-widest truncate">{designation}</p>
                    <div className="flex items-center gap-4 mt-4">
                        {employee.employee_code && (
                            <Badge variant="outline" className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-surface border-border/40 text-textSecondary flex gap-1.5 shadow-none">
                                <Hash size={10} className="mt-0.5" />
                                {employee.employee_code}
                            </Badge>
                        )}
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-textSecondary uppercase tracking-widest">
                            <Globe size={10} />
                            {workLoc}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 text-left">
                <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60 mb-6 flex items-center gap-2">
                        <User size={12} /> Contact Registry
                    </p>
                    <InfoRow icon={<Mail />} label="Secure Email" value={(employee as any).email} />
                    <InfoRow icon={<Phone />} label="Communication Line" value={employee.phone} />
                    <InfoRow
                        icon={<UserCheck />}
                        label="Identity Gender"
                        value={employee.gender && employee.gender.length > 0
                            ? employee.gender.charAt(0).toUpperCase() + employee.gender.slice(1)
                            : null}
                    />
                    <InfoRow
                        icon={<Calendar />}
                        label="Birth Chronology"
                        value={employee.date_of_birth
                            ? new Date(employee.date_of_birth).toLocaleDateString('en-US', {
                                day: 'numeric', month: 'long', year: 'numeric'
                            })
                            : null}
                    />
                    <InfoRow icon={<Shield />} label="Emergency Protocol" value={(employee as any).emergency_contact} />
                </div>

                <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60 mb-6 flex items-center gap-2">
                        <Briefcase size={12} /> Personnel Metrics
                    </p>
                    <InfoRow icon={<Briefcase />} label="Current Designation" value={designation} />
                    <InfoRow icon={<Building2 />} label="Employment Matrix" value={empType} />
                    <InfoRow icon={<Zap />} label="System Permissions" value={employee.role === 'company_admin' ? 'Administrative' : 'Standard Access'} />
                    <InfoRow
                        icon={<Calendar />}
                        label="Initialization Date"
                        value={formattedJoin}
                    />
                    <InfoRow
                        icon={<Hash />}
                        label="Registry Index"
                        value={employee.employee_code}
                        mono
                    />
                </div>
            </div>

            <div className="mt-12 pt-8 border-t border-border/20 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3 text-[10px] font-bold text-textSecondary uppercase tracking-widest">
                    <Clock size={12} className="text-primary/40" />
                    <span>
                        Object created{' '}
                        <span className="text-textPrimary">
                            {new Date(employee.created_at).toLocaleDateString('en-US', {
                                day: 'numeric', month: 'short', year: 'numeric'
                            })}
                        </span>
                    </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-surface rounded-lg border border-border/40">
                    <CircleDot size={10} className="text-success animate-pulse" />
                    <span className="text-[9px] font-bold text-textSecondary uppercase tracking-[0.2em]">
                        Read-only telemetry
                    </span>
                </div>
            </div>
        </Dialog>
    );
};
