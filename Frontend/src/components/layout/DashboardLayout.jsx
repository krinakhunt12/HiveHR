import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileMenu from "./MobileMenu";

const DashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Sidebar Desktop */}
            <div className="hidden lg:flex lg:flex-shrink-0">
                <Sidebar />
            </div>

            {/* Content Area */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
                {/* Header */}
                <Header onMenuClick={() => setSidebarOpen(true)} />

                {/* Main Content */}
                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>

                {/* Mobile Menu Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" />
                        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 border-r border-slate-800">
                            <Sidebar isOpen={true} onClose={() => setSidebarOpen(false)} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardLayout;
