import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, CheckCircle2, Clock, CreditCard, ShieldCheck, Users, Zap } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import MarketingLayout from '@/shared/layouts/MarketingLayout';
import { FeatureCard, Testimonial, PricingCard } from '@/shared/components/MarketingComponents';

const LandingPage = () => {
  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 bg-slate-50/20">
        <div className="max-w-7xl mx-auto text-center lg:text-left">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <div className="lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50/50 text-[var(--color-primary)]/80 text-sm font-semibold mb-8 uppercase tracking-widest border border-indigo-100/50">
                Secure & Scalable HR Suite
              </div>
              <h1 className="text-4xl lg:text-7xl font-semibold text-[var(--color-text-main)] leading-[1.05] mb-6 tracking-tight">
                Modern teams need <span className="text-[var(--color-primary)]/80 italic">modern culture.</span>
              </h1>
              <p className="text-base lg:text-lg text-slate-400 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Streamline global employee management, payroll, and performance with a minimal workspace designed for impact.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link to="/signup">
                  <Button size="lg" className="h-12 px-8 font-medium text-sm group">
                    Start Free Trial <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="h-12 px-8 font-medium text-sm border-slate-200">
                  Request a Demo
                </Button>
              </div>
            </div>
            <div className="lg:w-1/2 relative group">
              <div className="absolute -inset-4 bg-indigo-100/30 rounded-3xl blur-2xl group-hover:bg-indigo-100/40 transition-all duration-500"></div>
              <div className="relative rounded-2xl overflow-hidden border border-slate-100 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] bg-white p-2">
                <div className="rounded-xl overflow-hidden bg-slate-50/80 aspect-[16/10]">
                  <img
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200"
                    alt="Workplace Collaboration"
                    className="w-full h-full object-cover mix-blend-multiply opacity-80"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 border-y border-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-sm font-bold text-slate-300 uppercase tracking-[0.2em] text-center mb-10">Trusted by 2,000+ scaling organizations</p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-8 opacity-40 grayscale group hover:grayscale-0 transition-all duration-700">
            {['Acme', 'Sphere', 'Orbit', 'Locus', 'Nebula'].map((logo) => (
              <span key={logo} className="text-xl font-bold tracking-tighter text-slate-400">{logo}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Core Platform Section */}
      <section id="features" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl text-center mx-auto mb-20">
            <h2 className="text-2xl lg:text-4xl font-semibold text-[var(--color-text-main)] mb-4 tracking-tight">Everything you need, nothing you don't.</h2>
            <p className="text-base text-slate-400 font-medium leading-relaxed">We've removed the noise to focus on the essential artifacts that drive organizational success.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Users className="w-4 h-4 text-white" />}
              title="Global Directory"
              description="A beautifully synchronized source of truth for global personnel deployment."
            />
            <FeatureCard
              icon={<Clock className="w-4 h-4 text-white" />}
              title="Presence Layer"
              description="Seamless time tracking that prioritizes employee autonomy and trust."
            />
            <FeatureCard
              icon={<CreditCard className="w-4 h-4 text-white" />}
              title="Automated Payroll"
              description="Compliant, multi-currency payroll processing completed in seconds."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-4 h-4 text-white" />}
              title="Unified Security"
              description="Enterprise-grade SSO, encryption, and audit logs baked into the core."
            />
            <FeatureCard
              icon={<BarChart3 className="w-4 h-4 text-white" />}
              title="Predictive Insights"
              description="AI-driven churn analysis and hiring trajectory forecasting."
            />
            <FeatureCard
              icon={<Zap className="w-4 h-4 text-white" />}
              title="Open Artifacts"
              description="Extensible API to connect your entire enterprise stack effortlessly."
            />
          </div>
        </div>
      </section>

      {/* Deep Dive Section 1 */}
      <section className="py-32 bg-slate-50/20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="lg:w-1/2 order-2 lg:order-1 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-100/50 shadow-2xl bg-white p-3">
                <img
                  src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=1200"
                  alt="Data Dashboard"
                  className="w-full rounded-xl opacity-90 shadow-inner"
                />
              </div>
              {/* Floating card */}
              <div className="absolute top-1/2 -right-8 -translate-y-1/2 hidden lg:block">
                <Card className="px-6 py-4 border-slate-100 shadow-xl max-w-[240px]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className="text-sm font-semibold">Pulse Score: 98%</span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed font-medium">Team alignment is at a 12-month high after the last integration.</p>
                </Card>
              </div>
            </div>
            <div className="lg:w-1/2 order-1 lg:order-2">
              <span className="text-sm font-black uppercase tracking-widest text-[var(--color-primary)]/70 mb-4 block">Unified Infrastructure</span>
              <h3 className="text-3xl lg:text-5xl font-semibold text-[var(--color-text-main)] mb-6 tracking-tight leading-tight">Measure the output, not the input.</h3>
              <p className="text-base lg:text-lg text-slate-400 font-medium leading-relaxed mb-8">
                HiveHr provides the clarity managers need to make data-driven decisions without intruding on the workflow of individual contributors.
              </p>
              <ul className="space-y-4">
                {[
                  'Automated performance benchmarks',
                  'Zero-friction feedback loops',
                  'Asynchronous goal tracking'
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-medium text-slate-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-300"></div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-semibold tracking-tight">The new standard of HR.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            <Testimonial
              quote="The most elegant HR system I've used in 15 years. It removed the friction that was slowing down our engineering team."
              author="Sarah Jenkins"
              role="VP of People at Orbit"
            />
            <Testimonial
              quote="We migrated 250 employees in a single afternoon. The architecture is robust and the design is incredibly intuitive."
              author="Michael Chen"
              role="HR Operations at Locus"
            />
            <Testimonial
              quote="HiveHr allows us to scale globally without adding administrative overhead. A true game-changer for digital-first teams."
              author="David Miller"
              role="CEO at Nebula Labs"
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto rounded-3xl bg-slate-900 p-12 lg:p-20 text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <h2 className="text-3xl lg:text-5xl font-semibold text-white mb-6 tracking-tight">Ready to evolve your culture?</h2>
            <p className="text-slate-400 mb-10 text-lg max-w-xl mx-auto font-medium leading-relaxed">Join 2,000+ teams automating their operations today. Start your 14-day premium trial now.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/signup">
                <Button size="lg" className="h-14 px-10 font-semibold bg-white text-slate-950 hover:bg-slate-50 border-0 group shadow-xl">
                  Initialize Free Trial <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <span className="text-sm text-slate-500 font-medium">No credit card required.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <span className="text-sm font-black uppercase tracking-widest text-[var(--color-primary)]/70 mb-4 block">Connected Ecosystem</span>
              <h2 className="text-3xl lg:text-5xl font-semibold text-[var(--color-text-main)] mb-6 tracking-tight">Syncs with your entire stack.</h2>
              <p className="text-base lg:text-lg text-slate-400 font-medium leading-relaxed mb-10">
                Native integrations with the tools your team already uses. No more manual data entry or fragmented workflows.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'Slack', desc: 'Real-time notifications' },
                  { name: 'GitHub', desc: 'Engineering sync' },
                  { name: 'Jira', desc: 'Project management' },
                  { name: 'Google Workspace', desc: 'Identity & SSO' }
                ].map((item) => (
                  <div key={item.name} className="p-4 rounded-xl border border-slate-50 bg-slate-50/30">
                    <p className="text-sm font-semibold text-[var(--color-text-main)] mb-1">{item.name}</p>
                    <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 grid grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <div key={i} className="aspect-square rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center hover:scale-105 transition-transform">
                  <div className="w-10 bg-white rounded-lg shadow-sm"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-32 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl lg:text-5xl font-semibold tracking-tight mb-6">Built for every stage of growth.</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">From seed stage startups to global enterprises, HiveHr scales with your team's complexity.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Engineering', desc: 'Streamline technical onboarding and dev-ops culture.' },
              { title: 'Product Teams', desc: 'Align design and product with organizational goals.' },
              { title: 'Startups', desc: 'Move fast with lean HR infrastructure that grows with you.' },
              { title: 'Enterprise', desc: 'Maintain compliance and security at global scale.' }
            ].map((sol) => (
              <div key={sol.title} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                <h3 className="text-xl font-semibold mb-4 group-hover:text-indigo-400 transition-colors">{sol.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">{sol.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl text-center mx-auto mb-20">
            <h2 className="text-3xl lg:text-4xl font-semibold text-[var(--color-text-main)] mb-4 tracking-tight">Simple, predictable pricing.</h2>
            <p className="text-base text-slate-400 font-medium leading-relaxed">No hidden fees. No complex tiers. Just everything you need to manage your team.</p>
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

      {/* About Section */}
      <section id="about" className="py-32 bg-slate-50/30 border-y border-slate-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-sm font-black uppercase tracking-widest text-[var(--color-primary)]/70 mb-8 block">Our Manifesto</span>
          <h2 className="text-3xl lg:text-4xl font-semibold text-[var(--color-text-main)] mb-8 tracking-tight italic">"Software should get out of the way of the people it's designed to serve."</h2>
          <p className="text-lg text-slate-500 font-medium leading-[1.8] mb-12">
            We founded HiveHr on the belief that modern organizational culture is built on trust, transparency, and clarity. Our tools are designed to provide the infrastructure that enables high-performance teams to thrive without the administrative friction of legacy systems.
          </p>
          <div className="h-[1px] w-24 bg-slate-200 mx-auto"></div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="rounded-[40px] bg-indigo-600 p-12 lg:p-24 text-white relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mb-48 -mr-48"></div>
            <div className="relative z-10 flex flex-col lg:flex-row gap-16 items-center">
              <div className="lg:w-1/2 text-center lg:text-left">
                <h2 className="text-3xl lg:text-5xl font-semibold mb-6 tracking-tight">Let's talk about your culture.</h2>
                <p className="text-indigo-100 text-lg font-medium opacity-80 mb-10">Our consultants are ready to help you architect your organizational infrastructure.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button size="lg" className="bg-white text-indigo-600 hover:bg-slate-50 font-semibold px-8 h-14">Schedule a Consultation</Button>
                  <Button size="lg" variant="outline" className="border-indigo-400 text-white hover:bg-indigo-500/50 font-semibold px-8 h-14">Email Sales</Button>
                </div>
              </div>
              <div className="lg:w-1/2 w-full max-w-md">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-bold uppercase tracking-widest text-indigo-200 mb-2 block">Company Email</label>
                      <input type="text" placeholder="name@company.com" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 placeholder:text-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-white/30" />
                    </div>
                    <Button className="w-full h-12 bg-white text-indigo-600 hover:bg-indigo-50 font-bold">Request Access</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default LandingPage;
