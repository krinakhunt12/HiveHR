import { SimpleMarketingPage } from '@/shared/components/SimpleMarketingPage';

const Careers = () => (
    <SimpleMarketingPage 
        title="Careers"
        description="Join us in building the future of team management."
        content={
            <div className="space-y-8">
                <p>We are always looking for passionate people to join our global team. At HiveHr, we value autonomy, transparency, and impact.</p>
                <div className="p-8 rounded-2xl border border-border bg-surface">
                    <h3 className="text-xl font-bold text-textPrimary mb-4">Current Openings</h3>
                    <p>We don't have any specific roles open at the moment, but we're always happy to hear from talented individuals. Feel free to reach out to us at careers@hivehr.io.</p>
                </div>
            </div>
        }
    />
);

export default Careers;
