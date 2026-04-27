import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Menu, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-surface/70 backdrop-blur-xl z-50 border-b border-border shadow-soft">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <Leaf className="text-surface w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-textPrimary tracking-tight font-display">HiveHr</span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {[
              { name: 'Ecosystem', path: '/#features' },
              { name: 'Yields', path: '/solutions' },
              { name: 'Pricing', path: '/pricing' },
              { name: 'Cultivate', path: '/contact' }
            ].map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="text-xs font-bold uppercase tracking-[0.2em] text-textSecondary hover:text-primary transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <div className="h-4 w-[1px] bg-border"></div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="font-bold text-xs uppercase tracking-[0.2em] text-textSecondary hover:text-primary">Login</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="font-bold text-xs uppercase tracking-[0.2em] px-6 py-5 rounded-xl bg-primary text-surface shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">Get Started</Button>
              </Link>
            </div>
          </div>

          <div className="md:hidden">
            <Button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-textSecondary hover:text-primary transition-colors">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="min-h-screen bg-background border-b border-border px-6 py-8 space-y-5 animate-in slide-in-from-top-4 duration-300">
          {[
            { name: 'Ecosystem', path: '/#features' },
            { name: 'Yields', path: '/solutions' },
            { name: 'Pricing', path: '/pricing' },
            { name: 'Cultivate', path: '/contact' }
          ].map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsMenuOpen(false)}
              className="block text-xs font-bold text-textSecondary uppercase tracking-[0.2em] hover:text-primary px-2 py-1"
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-4 flex flex-col gap-4">
            <Link to="/login" className="w-full">
              <Button variant="outline" className="w-full text-xs font-bold uppercase tracking-[0.2em] h-14 rounded-xl border-border">Login</Button>
            </Link>
            <Link to="/signup" className="w-full">
              <Button className="w-full text-xs font-bold uppercase tracking-[0.2em] h-14 rounded-xl bg-primary text-surface shadow-lg shadow-primary/20">Get Started</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

