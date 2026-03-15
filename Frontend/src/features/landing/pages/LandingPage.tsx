import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  CreditCard, 
  ArrowRight,
  Menu,
  X,
  ShieldCheck,
  Zap,
  Globe,
  BarChart3,
  CheckCircle2,
  Instagram,
  Twitter,
  Linkedin,
  Github
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/70 backdrop-blur-md z-50 border-b border-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center shrink-0 shadow-sm shadow-indigo-100">
                <Users className="text-white w-4.5 h-4.5" />
              </div>
              <span className="text-lg font-semibold text-[var(--color-text-main)] tracking-tight">HiveHr</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              {['Features', 'Solutions', 'Pricing', 'Resources'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-slate-500 hover:text-[var(--color-primary)] transition-colors">{item}</a>
              ))}
              <div className="h-4 w-[1px] bg-slate-100"></div>
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="font-medium text-xs">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="font-medium text-xs px-5">Get Started</Button>
                </Link>
              </div>
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-400">
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-50 px-6 py-4 space-y-4">
            {['Features', 'Solutions', 'Pricing', 'Resources'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="block text-sm font-medium text-slate-500">{item}</a>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <Link to="/login" className="w-full">
                <Button variant="outline" className="w-full text-xs h-10 border-slate-100">Login</Button>
              </Link>
              <Link to="/signup" className="w-full">
                <Button className="w-full text-xs h-10">Get Started</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 bg-slate-50/20">
        <div className="max-w-7xl mx-auto text-center lg:text-left">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <div className="lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50/50 text-[var(--color-primary)]/80 text-[10px] font-semibold mb-8 uppercase tracking-widest border border-indigo-100/50">
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
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] text-center mb-10">Trusted by 2,000+ scaling organizations</p>
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
                            <span className="text-xs font-semibold">Pulse Score: 98%</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Team alignment is at a 12-month high after the last integration.</p>
                    </Card>
                </div>
            </div>
            <div className="lg:w-1/2 order-1 lg:order-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)]/70 mb-4 block">Unified Infrastructure</span>
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
                    <Link to="/signup w-full sm:w-auto">
                        <Button size="lg" className="h-14 px-10 font-semibold bg-white text-slate-950 hover:bg-slate-50 border-0 group shadow-xl">
                            Initialize Free Trial <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    <span className="text-xs text-slate-500 font-medium">No credit card required.</span>
                </div>
              </div>
          </div>
      </section>

      {/* Footer */}
      <footer className="pt-24 pb-12 px-6 border-t border-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-12 mb-16">
            <div className="col-span-2">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center shrink-0">
                        <Users className="text-white w-4.5 h-4.5" />
                    </div>
                    <span className="text-lg font-semibold text-[var(--color-text-main)] tracking-tight">HiveHr</span>
                </div>
                <p className="text-sm font-medium text-slate-400 leading-relaxed mb-6 max-w-xs">
                    Building the infrastructure for modern organizational culture. Elegant tools for high-performance teams.
                </p>
                <div className="flex gap-4">
                    {[Twitter, Linkedin, Instagram, Github].map((Icon, i) => (
                        <button key={i} className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-[var(--color-primary)] hover:bg-indigo-50 transition-all">
                            <Icon size={16} />
                        </button>
                    ))}
                </div>
            </div>
            
            <FooterCol title="Product" links={['Features', 'Integrations', 'Pricing', 'Documentation']} />
            <FooterCol title="Solutions" links={['Engineering', 'Product Teams', 'Startups', 'Enterprise']} />
            <FooterCol title="Company" links={['About', 'Careers', 'Manifesto', 'Privacy']} />
            <FooterCol title="Support" links={['Help Center', 'API Status', 'Security', 'Contact']} />
          </div>

          <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[11px] font-medium text-slate-300 uppercase tracking-widest">© 2026 HiveHr Infrastructure Inc.</p>
            <div className="flex gap-6">
                <a href="#" className="text-xs font-semibold text-slate-400 hover:text-[var(--color-primary)] transition-colors tracking-tight">System Status</a>
                <a href="#" className="text-xs font-semibold text-slate-400 hover:text-[var(--color-primary)] transition-colors tracking-tight">Security Protocol</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: any) => (
  <Card className="hover:border-slate-200 transition-all duration-300 shadow-none border-slate-100/60 group">
    <CardContent className="p-8">
      <div className="w-10 h-10 bg-[var(--color-primary)] rounded-lg flex items-center justify-center mb-6 shadow-sm shadow-indigo-100 group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-text-main)] mb-2 tracking-tight transition-colors group-hover:text-[var(--color-primary)]">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed font-medium">{description}</p>
    </CardContent>
  </Card>
);

const Testimonial = ({ quote, author, role }: any) => (
    <div className="relative">
        <p className="text-lg font-medium italic text-slate-500 leading-relaxed mb-6">"{quote}"</p>
        <div>
            <p className="text-sm font-semibold text-[var(--color-text-main)]">{author}</p>
            <p className="text-xs text-slate-400 font-medium">{role}</p>
        </div>
    </div>
);

const FooterCol = ({ title, links }: any) => (
    <div>
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-950 mb-6">{title}</h4>
        <ul className="space-y-4">
            {links.map((link: string) => (
                <li key={link}>
                    <a href="#" className="text-sm font-medium text-slate-400 hover:text-[var(--color-primary)] transition-colors tracking-tight">{link}</a>
                </li>
            ))}
        </ul>
    </div>
);

export default LandingPage;
