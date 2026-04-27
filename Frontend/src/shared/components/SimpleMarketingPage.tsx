import React from 'react';
import MarketingLayout from '@/shared/layouts/MarketingLayout';

interface SimpleMarketingPageProps {
    title: string;
    description: string;
    content: React.ReactNode;
}

export const SimpleMarketingPage: React.FC<SimpleMarketingPageProps> = ({ title, description, content }) => {
    return (
        <MarketingLayout>
            <div className="pt-40 pb-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl lg:text-6xl font-bold text-textPrimary tracking-tight font-display mb-6">
                        {title}
                    </h1>
                    <p className="text-lg text-textSecondary font-medium leading-relaxed mb-12">
                        {description}
                    </p>
                    <div className="prose prose-slate max-w-none text-textSecondary font-medium leading-relaxed">
                        {content}
                    </div>
                </div>
            </div>
        </MarketingLayout>
    );
};
