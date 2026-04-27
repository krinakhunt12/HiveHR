import { SimpleMarketingPage } from '@/shared/components/SimpleMarketingPage';

const PrivacyPolicy = () => (
    <SimpleMarketingPage 
        title="Privacy Policy"
        description="Your privacy is our priority. Learn how we handle your data."
        content={
            <div className="space-y-8">
                <section>
                    <h3 className="text-xl font-bold text-textPrimary mb-4">1. Data Collection</h3>
                    <p>We collect information you provide directly to us when you create an account, update your profile, or communicate with us. This includes your name, email address, and company details.</p>
                </section>
                <section>
                    <h3 className="text-xl font-bold text-textPrimary mb-4">2. Use of Information</h3>
                    <p>We use the information we collect to provide, maintain, and improve our services, to process your transactions, and to communicate with you about updates and offers.</p>
                </section>
                <section>
                    <h3 className="text-xl font-bold text-textPrimary mb-4">3. Data Security</h3>
                    <p>We implement industry-standard security measures, including encryption and secure servers, to protect your data from unauthorized access, disclosure, or alteration.</p>
                </section>
                <section>
                    <h3 className="text-xl font-bold text-textPrimary mb-4">4. Your Rights</h3>
                    <p>You have the right to access, update, or delete your personal information at any time through your account settings or by contacting our support team.</p>
                </section>
            </div>
        }
    />
);

export default PrivacyPolicy;
