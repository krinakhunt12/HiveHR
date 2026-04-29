import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Button } from './button';
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div
                className="absolute inset-0 bg-gray-900/50"
                onClick={onClose}
            />
            <div className={cn(
                "relative bg-background rounded-xl border  w-full max-w-xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300",
                className
            )}>
                <div className="flex items-center justify-between px-10 py-6 border-b border-border/50 bg-slate-50/50">
                    <h3 className="text-2xl font-bold text-foreground tracking-tight font-sans">{title}</h3>
                    <Button
                    variant="ghost"
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-2xl transition-all text-muted-foreground hover:text-foreground shadow-sm hover:shadow-md"
                    >
                        <X size={20} />
                    </Button>
                </div>
                <div className="p-8 max-h-[85vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

