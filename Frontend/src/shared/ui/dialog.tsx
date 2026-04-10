import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    className?: string;
}

export const Dialog = ({ isOpen, onClose, title, children, className }: DialogProps) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
                onClick={onClose}
            />
            <div className={cn(
                "relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200",
                className
            )}>
                <div className="flex items-center justify-between px-8 py-6 border-b border-soft">
                    <h3 className="text-xl font-bold text-main tracking-tight">{title}</h3>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-bg rounded-xl transition-colors text-dim hover:text-main"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-8 max-h-[80vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};
