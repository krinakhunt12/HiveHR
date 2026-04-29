import { 
    BookOpen, 
    Clock, 
    Laptop, 
    Users, 
    Lock,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';

// Auth
export const AUTH_SESSION_KEY = "hivehr_auth_session";

// Roles
export const ROLES = {
    ADMIN: 'admin',
    COMPANY_ADMIN: 'company_admin',
    EMPLOYEE: 'employee'
} as const;

// Task Statuses
export const TASK_STATUSES = ['all', 'pending', 'in_progress', 'completed', 'blocked'] as const;

export const TASK_STATUS_INFO = {
    pending: { label: 'Pending', color: 'text-textSecondary bg-slate-50 border-slate-200', icon: Clock },
    in_progress: { label: 'Active', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: Clock },
    completed: { label: 'Completed', color: 'text-green-600 bg-green-50 border-green-200', icon: CheckCircle2 },
    blocked: { label: 'Blocked', color: 'text-red-600 bg-red-50 border-red-200', icon: AlertCircle },
} as const;

// Task Priorities
export const TASK_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;

export const TASK_PRIORITY_COLORS = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-blue-500',
    low: 'bg-slate-400',
    default: 'bg-border'
} as const;

// Policy Categories
export const POLICY_CATEGORIES = [
    { id: 'all', name: 'All Policies', icon: BookOpen },
    { id: 'handbook', name: 'Employee Handbook', icon: Clock },
    { id: 'it', name: 'IT & Security', icon: Laptop },
    { id: 'hr', name: 'HR Policies', icon: Users },
    { id: 'legal', name: 'Legal & Compliance', icon: Lock },
] as const;

// Leave Statuses
export const LEAVE_STATUSES = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
} as const;
