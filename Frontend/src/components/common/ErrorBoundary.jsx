import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import AppLogger from '../../utils/AppLogger';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        AppLogger.error('Unhandled runtime error caught by ErrorBoundary:', { error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
                    <div className="max-w-md w-full animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-rose-200/50">
                            <AlertTriangle className="w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Something went wrong.</h1>
                        <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                            A critical system error occurred. We've logged the incident and our team is looking into it.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex items-center justify-center gap-2 w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                            >
                                <RefreshCcw className="w-5 h-5" />
                                Reload System
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="flex items-center justify-center gap-2 w-full py-4 bg-white text-slate-600 rounded-2xl font-bold border border-slate-200 hover:bg-slate-50 transition-all"
                            >
                                <Home className="w-5 h-5" />
                                Return Home
                            </button>
                        </div>
                        <div className="mt-8 pt-8 border-t border-slate-100">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Error Identification</p>
                            <p className="text-[10px] font-mono text-slate-400 mt-1 truncate">
                                {this.state.error?.message || 'Unknown Reference Error'}
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
