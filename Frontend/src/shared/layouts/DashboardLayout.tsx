import React, { useState } from 'react';
import {
    Bell,
    LogOut,
    Menu,
    X,
    Users,
    ChevronDown,
    Zap,
    ShieldCheck,
    Globe
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../utils/cn';
import { useLogout } from '../api/hooks/authHooks';
import { useGetMe } from '../api/hooks/hrHooks';
import { detectRole } from '../utils/authUtils';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';

interface NavItem {
    icon: React.ReactNode;
    label: string;
    path: string;
    onClick?: () => void;
}

interface DashboardLayoutProps {
    children: React.ReactNode;
    navItems: NavItem[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
    children,
    navItems
}) => {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const location = useLocation();
    const { data: user } = useGetMe();
    const { mutate: logout } = useLogout();

    const [activeInternalTab, setActiveInternalTab] = useState<string | null>(null);

    const userName = user?.full_name || 'System Operator';
    const rawRole = detectRole(user);
    const userRoleDisplay = rawRole === 'company_admin' ? 'Organization Admin' : rawRole === 'admin' ? 'Platform Operator' : 'Enterprise Member';

    const userInitials = (userName || 'U').split(' ').map((n: string) => n?.[0] || '').join('').slice(0, 2).toUpperCase();

    const handleNavClick = (item: NavItem) => {
        if (item.onClick) {
            item.onClick();
            setActiveInternalTab(item.path);
        }
    };

    return (
        <div className="min-h-screen bg-surface flex font-sans antialiased text-textPrimary">
            {/* Sidebar */}
            <aside
                className={cn(
                    "hidden lg:flex flex-col bg-white transition-all duration-500 fixed h-full z-40 overflow-x-hidden border-r border-border/40 shadow-2xl",
                    isSidebarExpanded ? "w-80" : "w-24"
                )}
            >
                {/* Sidebar Header / Logo Area */}
                <div className={cn(
                    "h-24 flex items-center transition-all duration-500",
                    isSidebarExpanded ? "px-8" : "justify-center"
                )}>
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                        <Users className="text-white w-6 h-6 relative z-10" />
                    </div>
                    {isSidebarExpanded && (
                        <div className="ml-4 overflow-hidden animate-in fade-in slide-in-from-left-2 duration-500 text-left">
                            <span className="block font-bold text-2xl text-textPrimary tracking-tighter leading-none">HiveHR</span>
                            <span className="text-[9px] font-bold text-primary/60 mt-1.5 block uppercase tracking-[0.3em]">Operational Node</span>
                        </div>
                    )}
                </div>

                {/* Navigation Section */}
                <nav className={cn(
                    "flex-1 space-y-2.5 overflow-y-auto overflow-x-hidden custom-scrollbar transition-all duration-500 py-6",
                    isSidebarExpanded ? "px-6" : "px-4"
                )}>
                    {navItems.map((item) => {
                        const isActive = item.onClick
                            ? (activeInternalTab === item.path || (!activeInternalTab && navItems.indexOf(item) === 0))
                            : location.pathname === item.path;

                        const Content = (
                            <>
                                <div className={cn(
                                    "shrink-0 transition-all duration-300 flex items-center justify-center",
                                    isActive ? "text-primary scale-110" : "text-textSecondary/60 group-hover:text-primary group-hover:scale-105",
                                    !isSidebarExpanded && "w-full"
                                )}>
                                    {React.cloneElement(item.icon as React.ReactElement, { size: isSidebarExpanded ? 18 : 24 } as any)}
                                </div>
                                {isSidebarExpanded && (
                                    <span className={cn(
                                        "text-sm font-bold tracking-tight transition-all truncate",
                                        isActive ? "text-primary" : "text-textSecondary group-hover:text-textPrimary"
                                    )}>{item.label}</span>
                                )}
                                {isActive && isSidebarExpanded && (
                                    <div className="ml-auto animate-in zoom-in duration-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
                                    </div>
                                )}
                            </>
                        );

                        const baseClasses = cn(
                            "flex items-center w-full transition-all duration-300 relative group overflow-hidden",
                            isSidebarExpanded ? "px-5 h-12 gap-4 rounded-2xl" : "h-14 justify-center rounded-2xl",
                            isActive
                                ? "bg-primary/5 border border-primary/20 shadow-sm"
                                : "hover:bg-surface border border-transparent"
                        );

                        if (item.onClick) {
                            return (
                                <button key={item.label} onClick={() => handleNavClick(item)} className={baseClasses}>
                                    {Content}
                                </button>
                            );
                        }

                        return (
                            <Link key={item.label} to={item.path} className={baseClasses}>
                                {Content}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="mt-auto p-6 space-y-4 border-t border-border/20">
                    {isSidebarExpanded ? (
                        <div className="p-4 bg-surface rounded-[1.5rem] border border-border/40 transition-all hover:shadow-lg hover:border-primary/20 group cursor-pointer text-left">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-md shadow-primary/20 border border-white/10">
                                    {userInitials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-textPrimary truncate tracking-tight">{userName}</p>
                                    <p className="text-[10px] font-bold text-textSecondary/60 mt-1 uppercase tracking-widest">{userRoleDisplay}</p>
                                </div>
                                <ChevronDown size={14} className="text-textSecondary group-hover:text-primary transition-colors" />
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center transition-all duration-500">
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-bold text-sm border border-primary/10 shadow-inner group cursor-pointer hover:bg-primary hover:text-white transition-all">
                                {userInitials}
                            </div>
                        </div>
                    )}

                    <Button
                        variant="ghost"
                        onClick={() => logout()}
                        className={cn(
                            "flex items-center w-full h-12 rounded-2xl transition-all duration-300 text-textSecondary hover:text-error hover:bg-error/5 group",
                            isSidebarExpanded ? "px-5 gap-4 justify-start" : "justify-center px-0"
                        )}
                    >
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        {isSidebarExpanded && <span className="text-xs font-bold uppercase tracking-[0.2em]">Logout Protocol</span>}
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className={cn(
                "flex-1 flex flex-col min-h-screen transition-all duration-500 bg-surface",
                isSidebarExpanded ? "lg:ml-80" : "lg:ml-24"
            )}>
                {/* Top Header */}
                <header className={cn(
                    "h-20 bg-white/80 backdrop-blur-xl border-b border-border/40 flex items-center justify-between sticky top-0 z-20 transition-all duration-500",
                    isSidebarExpanded ? "px-10" : "px-8"
                )}>
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface border border-border/40 text-textSecondary hover:text-primary hover:border-primary/20 hover:shadow-md transition-all active:scale-95"
                        >
                            {isSidebarExpanded ? <X size={18} /> : <Menu size={18} />}
                        </button>
                        <div className="h-6 w-[1px] bg-border/40 hidden md:block" />
                        <div className="hidden md:flex items-center gap-2">
                           <Badge variant="outline" className="bg-surface border-border/60 text-[10px] font-bold text-textSecondary uppercase tracking-widest px-3 py-1 shadow-none">
                             Node Terminal
                           </Badge>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex items-center gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-success/5 rounded-xl border border-success/10 group cursor-default">
                                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(var(--success-rgb),0.6)]" />
                                <span className="text-[10px] font-bold text-success uppercase tracking-widest">Network Live</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-xl border border-primary/10">
                                <Zap size={12} className="text-primary" />
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">v2.4.0</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface border border-border/40 text-textSecondary hover:text-primary hover:border-primary/20 transition-all relative group">
                                <Bell size={18} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white animate-bounce shadow-sm shadow-error/20" />
                            </button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface border border-border/40 text-textSecondary hover:text-primary hover:border-primary/20 transition-all group">
                                <Globe size={18} className="group-hover:rotate-180 transition-transform duration-1000" />
                            </button>
                        </div>
                    </div>
                </header>

                <div className="p-8 lg:p-12 w-full max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
                    <div className="bg-white rounded-[3rem] p-1 shadow-2xl shadow-black/5 min-h-[calc(100vh-12rem)]">
                        <div className="bg-surface rounded-[2.8rem] p-8 lg:p-12 min-h-full">
                           {children}
                        </div>
                    </div>
                </div>

                {/* Global Infrastructure Status Footer */}
                <footer className="p-10 flex items-center justify-between text-left opacity-30 mt-auto">
                    <div className="flex items-center gap-4">
                        <ShieldCheck size={14} className="text-textSecondary" />
                        <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-textSecondary">Encrypted Core v2.4</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-textSecondary">HiveHR Node Cluster</span>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default DashboardLayout;