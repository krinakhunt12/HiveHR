import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { cn } from "../../lib/utils";

const DashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
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
                    <div className="py-10 px-6 sm:px-10 lg:px-12 max-w-7xl mx-auto">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </div>
                </main>

                {/* Mobile Menu Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" />
                        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-black border-r border-white/10">
                            <Sidebar isOpen={true} onClose={() => setSidebarOpen(false)} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardLayout;
