import React from "react";
import { BarChart3, LogOut, User, Settings, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSupabaseAuth } from "../../hooks/useSupabaseAuth";

const DashboardLayout = ({ children }) => {
    const navigate = useNavigate();
    const { profile, logout } = useSupabaseAuth();
    const isAdmin = profile?.role === 'admin';

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Navigation */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-600 rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-xl font-bold text-slate-900 cursor-pointer" onClick={() => navigate("/dashboard")}>
                                HiveHR
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex items-center gap-2">
                                {isAdmin ? (
                                    <button
                                        onClick={() => navigate("/dashboard/admin")}
                                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                                    >
                                        Admin Panel
                                    </button>
                                ) : profile?.role === 'hr' ? (
                                    <button
                                        onClick={() => navigate("/dashboard/hr")}
                                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                                    >
                                        HR Panel
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => navigate("/dashboard/employee")}
                                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                                    >
                                        Dashboard
                                    </button>
                                )}
                                <button
                                    onClick={() => navigate("/attendance")}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                                >
                                    <Clock className="w-4 h-4" />
                                    Attendance
                                </button>
                                <button
                                    onClick={() => navigate("/leaves")}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                                >
                                    <Clock className="w-4 h-4" />
                                    Leave
                                </button>
                                {isAdmin && (
                                    <button
                                        onClick={() => navigate("/people")}
                                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                                    >
                                        Employee Management
                                    </button>
                                )}
                            </div>
                            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                <Settings className="w-5 h-5 text-slate-600" />
                            </button>
                            <div className="flex items-center gap-3 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                                  <User className="w-5 h-5 text-slate-500" />
                                </div>
                                <div className="hidden lg:block text-left pr-2">
                                  <p className="text-xs font-bold text-slate-900 truncate max-w-[100px]">{profile?.full_name || 'User'}</p>
                                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">{profile?.role}</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleLogout}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-red-600"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main>{children}</main>
        </div>
    );
};

export default DashboardLayout;


// import React, { useState } from 'react';
// import Sidebar from './Sidebar';
// import Header from './Header';
// import MobileMenu from './MobileMenu';

// const DashboardLayout = ({ children }) => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
//       {/* Mobile Menu */}
//       <MobileMenu 
//         isOpen={sidebarOpen} 
//         onClose={() => setSidebarOpen(false)} 
//       />
      
//       {/* Sidebar */}
//       <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
//         <Sidebar />
//       </div>

//       {/* Main Content */}
//       <div className="lg:pl-72">
//         {/* Header */}
//         <Header onMenuClick={() => setSidebarOpen(true)} />
        
//         {/* Page Content */}
//         <main className="py-8">
//           <div className="px-4 sm:px-6 lg:px-8">
//             {children}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default DashboardLayout;
