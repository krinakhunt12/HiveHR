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
    MapPin,
    Calendar,
    Building2,
    Clock,
    CircleDot,
    UserCheck,
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface EmployeeViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: Employee | null;
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
    active: { label: 'Active', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500' },
    inactive: { label: 'Inactive', color: 'bg-gray-50 text-gray-500 border-gray-200', dot: 'bg-gray-400' },
    probation: { label: 'Probation', color: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-500' },
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
    <div className="flex items-start gap-4 py-3.5 border-b border-border/40 last:border-0">
        <div className="w-8 h-8 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-primary/60">
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-textSecondary mb-0.5">{label}</p>
            <p className={cn(
                'text-sm font-semibold text-textPrimary truncate',
                mono && 'font-mono tracking-wide',
                !value && 'text-textSecondary italic font-normal'
            )}>
                {value || 'Not provided'}
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
        ? new Date(joinDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
        : null;

    const initials = (employee.full_name || 'U')
        .split(' ')
        .map((n: string) => n?.[0] || '')
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Employee Profile" className="max-w-2xl">
            {/* Hero section */}
            <div className="flex items-center gap-6 mb-10 pb-10 border-b border-border/40">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/15 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-primary tracking-tight">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-textPrimary tracking-tight truncate">{employee.full_name}</h2>
                    <p className="text-sm font-semibold text-primary/70 mt-0.5 truncate">{designation}</p>
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                        {/* Status badge */}
                        <span className={cn(
                            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border',
                            status.color
                        )}>
                            <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
                            {status.label}
                        </span>
                        {/* Employee code badge */}
                        {employee.employee_code && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-500 border border-gray-200">
                                <Hash size={9} />
                                {employee.employee_code}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Two-column grid of info sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2">
                {/* Left column — Personal & Contact */}
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-textSecondary mb-3 flex items-center gap-2">
                        <User size={10} /> Personal & Contact
                    </p>
                    <InfoRow icon={<Mail size={14} />} label="Email" value={(employee as any).email} />
                    <InfoRow icon={<Phone size={14} />} label="Phone" value={employee.phone} />
                    <InfoRow
                        icon={<UserCheck size={14} />}
                        label="Gender"
                        value={employee.gender && employee.gender.length > 0
                            ? employee.gender.charAt(0).toUpperCase() + employee.gender.slice(1)
                            : null}
                    />
                    <InfoRow
                        icon={<Calendar size={14} />}
                        label="Date of Birth"
                        value={employee.date_of_birth
                            ? new Date(employee.date_of_birth).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'long', year: 'numeric'
                            })
                            : null}
                    />
                    <InfoRow icon={<Shield size={14} />} label="Emergency Contact" value={(employee as any).emergency_contact} />
                </div>

                {/* Right column — Employment */}
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-textSecondary mb-3 flex items-center gap-2">
                        <Briefcase size={10} /> Employment Details
                    </p>
                    <InfoRow icon={<Briefcase size={14} />} label="Designation" value={designation} />
                    <InfoRow icon={<Building2 size={14} />} label="Employment Type" value={empType} />
                    <InfoRow icon={<MapPin size={14} />} label="Work Location" value={workLoc} />
                    <InfoRow
                        icon={<Calendar size={14} />}
                        label="Date of Joining"
                        value={formattedJoin}
                    />
                    <InfoRow
                        icon={<Hash size={14} />}
                        label="Employee Code"
                        value={employee.employee_code}
                        mono
                    />
                </div>
            </div>

            {/* Status footer strip */}
            <div className="mt-10 pt-6 border-t border-border/40 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-textSecondary">
                    <Clock size={10} />
                    <span>
                        Record created{' '}
                        {new Date(employee.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                        })}
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <CircleDot size={10} className="text-primary/40" />
                    <span className="text-xs font-bold text-textSecondary">
                        Read-only view
                    </span>
                </div>
            </div>
        </Dialog>
    );
};
