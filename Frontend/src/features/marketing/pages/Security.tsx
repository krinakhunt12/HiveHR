import { SimpleMarketingPage } from '@/shared/components/SimpleMarketingPage';

const Security = () => (
    <SimpleMarketingPage 
        title="Security"
        description="Learn about our enterprise-grade security protocols and how we protect your data."
        content={
            <div className="space-y-8">
                <section>
                    <h3 className="text-xl font-bold text-textPrimary mb-4">Data Encryption</h3>
                    <p>All data is encrypted at rest and in transit using industry-standard AES-256 and TLS 1.3 encryption.</p>
                </section>
                <section>
                    <h3 className="text-xl font-bold text-textPrimary mb-4">Network Security</h3>
                    <p>Our infrastructure is protected by advanced firewalls, DDoS protection, and regular security audits.</p>
                </section>
                <section>
                    <h3 className="text-xl font-bold text-textPrimary mb-4">Access Control</h3>
                    <p>We enforce strict Row Level Security (RLS) on our databases to ensure multi-tenant isolation and data integrity.</p>
                </section>
            </div>
        }
    />
);

export default Security;
