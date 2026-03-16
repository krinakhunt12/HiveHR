import MarketingLayout from '@/shared/layouts/MarketingLayout';
import { PricingCard } from '@/shared/components/MarketingComponents';

const Pricing = () => {
  return (
    <MarketingLayout>
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl text-center mx-auto mb-20">
            <h2 className="text-3xl lg:text-5xl font-semibold text-[var(--color-text-main)] mb-4 tracking-tight">Simple, predictable pricing.</h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">Join 2,000+ teams automating their operations today.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <PricingCard 
              name="Starter"
              price="0"
              desc="For teams just getting started."
              features={['Up to 10 employees', 'Basic directory', 'Time tracking', 'Email support']}
            />
            <PricingCard 
              name="Professional"
              price="49"
              featured
              desc="Everything you need to scale."
              features={['Unlimited employees', 'Automated payroll', 'Advanced analytics', 'Priority support', 'Integrations']}
            />
            <PricingCard 
              name="Enterprise"
              price="Custom"
              desc="For global organizations."
              features={['White-glove migration', 'SAML/SSO', 'Custom contracts', 'Dedicated account manager', 'Audit logs']}
            />
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
           <div className="text-center mb-16">
             <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
           </div>
           <div className="space-y-8">
             {[
               { q: 'Can I change plans later?', a: 'Yes, you can upgrade or downgrade your plan at any time from your settings.' },
               { q: 'Is there a free trial?', a: 'We offer a 14-day free trial of the Professional plan. No credit card required.' },
               { q: 'Do you offer discount for non-profits?', a: 'Absolutely. Contact our sales team for more information on our social impact pricing.' }
             ].map(faq => (
               <div key={faq.q}>
                 <h4 className="font-semibold text-slate-900 mb-2">{faq.q}</h4>
                 <p className="text-slate-500 text-sm">{faq.a}</p>
               </div>
             ))}
           </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default Pricing;
