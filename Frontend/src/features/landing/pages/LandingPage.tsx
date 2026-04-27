import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, CheckCircle2, Clock, CreditCard, ShieldCheck, Users, Zap } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import MarketingLayout from '@/shared/layouts/MarketingLayout';
import { FeatureCard, Testimonial, PricingCard } from '@/shared/components/MarketingComponents';

const LandingPage = () => {
  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 bg-background/50">
        <div className="max-w-7xl mx-auto text-center lg:text-left">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <div className="lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-sm font-semibold mb-8  border border-primary/10">
                Safe and Simple HR Software
              </div>
              <h1 className="text-4xl lg:text-7xl font-bold text-textPrimary leading-[1.05] mb-6 tracking-tight font-display">
                Build a better team with <span className="text-primary italic">better tools.</span>
              </h1>
              <p className="text-base lg:text-lg text-textSecondary mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Manage your team, payroll, and performance all in one place with a simple workspace designed for impact.
              </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Link to="/signup">
                    <Button size="lg" className="h-12 px-8 font-medium text-sm group">
                      Start Free Trial <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button size="lg" variant="outline" className="h-12 px-8 font-medium text-sm  border-border hover:bg-primary/5">
                      Request a Demo
                    </Button>
                  </Link>
                </div>
            </div>
            <div className="lg:w-1/2 relative group">
              <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-3xl group-hover:bg-primary/20 transition-all duration-500"></div>
              <div className="relative rounded-2xl overflow-hidden border border-border  bg-surface p-2">
                <div className="rounded-xl overflow-hidden bg-background aspect-[16/10]">
                  <img
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200"
                    alt="Workplace Collaboration"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-sm font-medium text-textSecondary text-center mb-10">Trusted by 2,000+ scaling organizations</p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-8  grayscale group hover:grayscale-0 transition-all duration-700">
            {['Acme', 'Sphere', 'Orbit', 'Locus', 'Nebula'].map((logo) => (
              <span key={logo} className="text-xl font-medium text-textSecondary uppercase">{logo}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Core Platform Section */}
      <section id="features" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl text-center mx-auto mb-24">
            <h2 className="text-3xl lg:text-5xl font-bold text-textPrimary mb-6 tracking-tight font-display">Everything you need to manage your team.</h2>
            <p className="text-base text-textSecondary font-medium leading-relaxed ">We focus on the simple tools that help your team succeed.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Users className="w-4 h-4 text-white" />}
              title="Team Directory"
              description="One place to keep all your employee information up to date."
            />
            <FeatureCard
              icon={<Clock className="w-4 h-4 text-white" />}
              title="Time Tracking"
              description="Easy time tracking that helps your team stay focused and productive."
            />
            <FeatureCard
              icon={<CreditCard className="w-4 h-4 text-white" />}
              title="Simple Payroll"
              description="Pay your team in any currency in just a few simple clicks."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-4 h-4 text-white" />}
              title="Safe & Secure"
              description="Secure login and data protection for your peace of mind."
            />
            <FeatureCard
              icon={<BarChart3 className="w-4 h-4 text-white" />}
              title="Smart Insights"
              description="Insights to help you hire and keep great people on your team."
            />
            <FeatureCard
              icon={<Zap className="w-4 h-4 text-white" />}
              title="Easy Connect"
              description="Connect with the tools you already use every single day."
            />
          </div>
        </div>
      </section>

      {/* Deep Dive Section 1 */}
      <section className="py-32 bg-background/50 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-24">
            <div className="lg:w-1/2 order-2 lg:order-1 relative">
              <div className="relative rounded-2xl overflow-hidden border border-border  bg-surface p-3">
                <img
                  src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=1200"
                  alt="Data Dashboard"
                  className="w-full rounded-xl shadow-inner"
                />
              </div>
              {/* Floating card */}
              <div className="absolute top-1/2 -right-8 -translate-y-1/2 hidden lg:block">
                <Card className="px-6 py-5 border-border  max-w-[260px] bg-surface">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-success/10 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    </div>
                    <span className="text-sm font-bold">Pulse Score: 98%</span>
                  </div>
                  <p className="text-xs text-textSecondary leading-relaxed font-bold">Team alignment is at a 12-month high after the last integration.</p>
                </Card>
              </div>
            </div>
            <div className="lg:w-1/2 order-1 lg:order-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-6 block">Complete Team View</span>
              <h3 className="text-3xl lg:text-6xl font-bold text-textPrimary mb-8 tracking-tight leading-[1.1] font-display">Focus on results, not hours.</h3>
              <p className="text-base lg:text-lg text-textSecondary font-medium leading-relaxed mb-10">
                HiveHr gives you the clear info you need to lead your team without getting in their way.
              </p>
              <ul className="space-y-5">
                {[
                  'Automatic performance tracking',
                  'Easy team feedback',
                  'Track goals anytime'
                ].map((item) => (
                  <li key={item} className="flex items-center gap-4 text-sm font-medium text-textPrimary">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
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
            <h2 className="text-3xl font-semibold tracking-tight">A better way to manage HR.</h2>
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
        <div className="max-w-5xl mx-auto rounded-[3rem] bg-textPrimary p-12 lg:p-24 text-center relative overflow-hidden group border border-primary/10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
          <div className="relative z-10">
            <h2 className="text-3xl lg:text-6xl font-bold text-surface mb-8 tracking-tight font-display">Ready to build a better team?</h2>
            <p className="text-textSecondary mb-12 text-lg max-w-xl mx-auto font-medium leading-relaxed">Join 2,000+ teams making their work easier today. Start your 14-day trial now.</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/signup">
                  <Button size="lg" className="h-14 px-10 font-bold text-xs  bg-surface text-textPrimary hover:bg-surface/90 border-0 group ">
                    Start Your Free Trial <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
              </Link>
              <span className="text-xs text-textSecondary font-bold ">No credit card required.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-24">
            <div className="lg:w-1/2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-6 block">Works With Your Tools</span>
              <h2 className="text-3xl lg:text-6xl font-bold text-textPrimary mb-8 tracking-tight font-display">Connects with what you use.</h2>
              <p className="text-base lg:text-lg text-textSecondary font-medium leading-relaxed mb-12">
                Connect HiveHr with the tools your team already uses every day. No more manual data entry.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'Slack', desc: 'Real-time notifications' },
                  { name: 'GitHub', desc: 'Engineering sync' },
                  { name: 'Jira', desc: 'Project management' },
                  { name: 'Google Workspace', desc: 'Identity & SSO' }
                ].map((item) => (
                  <div key={item.name} className="p-5 rounded-2xl border border-border bg-background/50 group hover:border-primary/30 transition-all">
                    <p className="text-sm font-bold text-textPrimary mb-1 group-hover:text-primary transition-colors">{item.name}</p>
                    <p className="text-xs text-textSecondary font-bold ">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 grid grid-cols-3 gap-6 grayscale">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <div key={i} className="aspect-square rounded-2xl bg-background border border-border flex items-center justify-center hover:scale-105 transition-all">
                  <div className="w-10 h-10 bg-surface rounded-lg shadow-sm border border-border/50"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-32 bg-textPrimary text-surface overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[150px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primaryLight rounded-full blur-[150px]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-3xl lg:text-6xl font-bold tracking-tight mb-8 font-display leading-[1.1]">Built for teams of all sizes.</h2>
            <p className="text-textSecondary text-lg max-w-2xl mx-auto font-medium">From small startups to large companies, HiveHr grows with your team.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Engineering', desc: 'Streamline technical onboarding and dev-ops culture.' },
              { title: 'Product Teams', desc: 'Align design and product with organizational goals.' },
              { title: 'Startups', desc: 'Move fast with lean HR infrastructure that grows with you.' },
              { title: 'Enterprise', desc: 'Maintain compliance and security at global scale.' }
            ].map((sol) => (
              <div key={sol.title} className="p-10 rounded-[2.5rem] bg-surface/5 border border-surface/10 hover:bg-surface/10 transition-all group hover:-translate-y-2">
                <h3 className="text-xl font-bold mb-5 group-hover:text-primary transition-colors">{sol.title}</h3>
                <p className="text-sm text-textSecondary leading-relaxed font-bold">{sol.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl text-center mx-auto mb-24">
            <h2 className="text-3xl lg:text-6xl font-bold text-textPrimary mb-6 tracking-tight font-display">Simple, clear pricing.</h2>
            <p className="text-base text-textSecondary font-medium leading-relaxed ">No hidden fees. No complex plans. Just everything you need to manage your team.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
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
      <section id="about" className="py-32 bg-background/50 border-y border-border">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-10 block">Our Manifesto</span>
          <h2 className="text-3xl lg:text-5xl font-bold text-textPrimary mb-10 tracking-tight italic font-display">"Software should make work easier, not harder."</h2>
          <p className="text-lg lg:text-xl text-textSecondary font-medium leading-[1.8] mb-12">
            We founded HiveHr because we believe great teams are built on trust and clear communication. Our tools help your team do their best work without the stress of old, complicated systems.
          </p>
          <div className="h-[1px] w-24 bg-primary/20 mx-auto"></div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="rounded-[3rem] bg-primary p-12 lg:p-24 text-surface relative overflow-hidden border border-white/10">
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[150px] -mb-48 -mr-48"></div>
            <div className="relative z-10 flex flex-col lg:flex-row gap-16 items-center">
              <div className="lg:w-1/2 text-center lg:text-left">
                <h2 className="text-3xl lg:text-6xl font-bold mb-8 tracking-tight font-display">Let's build a better workplace.</h2>
                <p className="text-surface/80 text-lg font-medium mb-12">We're here to help you manage your team more effectively and grow your business.</p>
                <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                  <Link to="/contact">
                    <Button size="lg" className="w-full sm:w-auto px-10">Schedule a Consultation</Button>
                  </Link>
                  <a href="mailto:sales@hivehr.io">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto px-10">Email Sales</Button>
                  </a>
                </div>
              </div>
              <div className="lg:w-1/2 w-full max-w-md">
                <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/20 ">
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-[0.2em] text-surface/60 mb-3 block ml-1">Company Email</label>
                      <input type="text" placeholder="name@company.com" className="w-full bg-white/10 border border-white/10 rounded-xl px-5 py-4 placeholder:text-surface/30 focus:outline-none focus:ring-4 focus:ring-white/10 transition-all text-sm font-bold" />
                    </div>
                    <Button className="w-full h-14 bg-surface text-primary hover:bg-surface/95 font-bold text-xs uppercase tracking-[0.2em] rounded-xl ">Request Access</Button>
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
