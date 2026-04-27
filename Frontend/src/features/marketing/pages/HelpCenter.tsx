import { SimpleMarketingPage } from '@/shared/components/SimpleMarketingPage';

const HelpCenter = () => (
    <SimpleMarketingPage 
        title="Help Center"
        description="Find answers to your questions and learn how to get the most out of HiveHr."
        content={
            <div className="grid md:grid-cols-2 gap-8">
                <div className="p-8 rounded-2xl border border-border bg-surface hover:border-primary/30 transition-colors">
                    <h3 className="text-xl font-bold text-textPrimary mb-4">Getting Started</h3>
                    <p className="text-sm">Learn the basics of setting up your organization and inviting your team.</p>
                </div>
                <div className="p-8 rounded-2xl border border-border bg-surface hover:border-primary/30 transition-colors">
                    <h3 className="text-xl font-bold text-textPrimary mb-4">Employee Management</h3>
                    <p className="text-sm">Manage profiles, track time, and handle leave requests efficiently.</p>
                </div>
                <div className="p-8 rounded-2xl border border-border bg-surface hover:border-primary/30 transition-colors">
                    <h3 className="text-xl font-bold text-textPrimary mb-4">Payroll & Billing</h3>
                    <p className="text-sm">Understand how multi-currency payroll works and manage your subscription.</p>
                </div>
                <div className="p-8 rounded-2xl border border-border bg-surface hover:border-primary/30 transition-colors">
                    <h3 className="text-xl font-bold text-textPrimary mb-4">Account Security</h3>
                    <p className="text-sm">Best practices for keeping your team's data safe and secure.</p>
                </div>
            </div>
        }
    />
);

export default HelpCenter;
