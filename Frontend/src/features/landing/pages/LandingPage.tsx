import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  CreditCard, 
  Search, 
  BarChart3, 
  CheckCircle2, 
  ArrowRight,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Users className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight tracking-[-0.02em]">HiveHr</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Features</a>
              <a href="#solutions" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Solutions</a>
              <a href="#pricing" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Pricing</a>
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="font-semibold">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="font-semibold px-5">Get Started</Button>
                </Link>
              </div>
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-600">
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 p-4 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
            <a href="#features" className="text-slate-600 font-medium px-2">Features</a>
            <a href="#solutions" className="text-slate-600 font-medium px-2">Solutions</a>
            <a href="#pricing" className="text-slate-600 font-medium px-2">Pricing</a>
            <hr className="border-slate-100" />
            <Link to="/login" className="w-full text-center py-2 text-slate-600 font-medium">Login</Link>
            <Link to="/signup" className="w-full">
              <Button className="w-full">Get Started</Button>
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold mb-6">
                NEW: AI-POWERED PERFORMANCE REVIEWS
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.05] mb-6 tracking-tight">
                Empower your <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">workforce</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                The all-in-one HR platform that helps you hire, manage, and pay your teams anywhere in the world.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto gap-2 font-bold px-8">
                    Start Free Trial <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="w-full sm:w-auto font-bold px-8">
                  Book a Demo
                </Button>
              </div>
              <div className="mt-12 flex items-center justify-center lg:justify-start gap-4 text-xs text-slate-500 font-bold uppercase tracking-wider">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <img key={i} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                  ))}
                </div>
                Trusted by 2,000+ teams
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="absolute -top-10 -left-10 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-40"></div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-purple-100 rounded-full blur-3xl opacity-40"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 aspect-[4/3]">
                <img 
                  src="https://images.unsplash.com/photo-1600880212319-752409f42774?auto=format&fit=crop&q=80&w=1200" 
                  alt="HR Dashboard" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">Everything You Need</h2>
            <p className="text-slate-600 max-w-2xl mx-auto font-medium">Simplify your HR operations with our comprehensive suite of tools.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Users className="w-5 h-5 text-white" />}
              title="Employee Directory"
              description="Keep all your employee information in one secure, centralized place."
            />
            <FeatureCard 
              icon={<Clock className="w-5 h-5 text-white" />}
              title="Attendance Tracking"
              description="Effortless clock-ins, clock-outs, and automated timesheets."
            />
            <FeatureCard 
              icon={<CreditCard className="w-5 h-5 text-white" />}
              title="Payroll Automation"
              description="Execute payroll in minutes, with taxes and deductions handled automatically."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: any) => (
  <Card className="border-none shadow-none bg-white p-2">
    <CardContent className="p-8">
      <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-100">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed font-medium">{description}</p>
    </CardContent>
  </Card>
);

export default LandingPage;
