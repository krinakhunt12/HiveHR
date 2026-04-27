import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Cookie, X } from 'lucide-react';

export const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('hivehr_cookie_consent');
        if (!consent) {
            // Small delay for better UX
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('hivehr_cookie_consent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:max-w-[400px] z-[9999] animate-in slide-in-from-bottom-10 fade-in duration-1000">
            <div className="bg-surface border border-soft shadow-premium rounded-2xl p-6 flex flex-col gap-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center shrink-0">
                            <Cookie className="text-primary w-5 h-5" />
                        </div>
                        <div className="space-y-1.5 text-left">
                            <h4 className="text-sm font-bold text-main tracking-tight">Cookie & Privacy Policy</h4>
                            <p className="text-xs text-muted leading-relaxed font-medium">
                                We use cookies to enhance your experience. By continuing, you agree to our use of cookies and our <a href="#" className="text-primary hover:underline font-bold">Privacy Policy</a>.
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setIsVisible(false)} className="text-dim hover:text-main transition-colors p-1">
                        <X size={16} />
                    </button>
                </div>
                <div className="flex items-center gap-3 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)} className="text-xs font-bold text-muted hover:text-main h-9 px-4">
                        Decline
                    </Button>
                    <Button size="sm" onClick={handleAccept} className="text-xs font-bold h-9 px-6 bg-primary shadow-sm hover:shadow-md transition-all">
                        Accept All
                    </Button>
                </div>
            </div>
        </div>
    );
};
