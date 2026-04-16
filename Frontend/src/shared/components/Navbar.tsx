import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Menu, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-white/70 backdrop-blur-xl z-50 border-b border-white shadow-soft">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10 group-hover:scale-110 transition-transform">
              <Leaf className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-[var(--text-main)] tracking-tight font-sans">HiveHr</span>
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
                className="text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-[var(--primary)] transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <div className="h-4 w-[1px] bg-slate-200"></div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="font-bold text-xs uppercase tracking-widest text-slate-500 hover:text-emerald-600">Login</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="font-bold text-xs uppercase tracking-widest px-6 py-5 rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-95">Get Started</Button>
              </Link>
            </div>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-b border-slate-100 px-6 py-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
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
              className="block text-sm font-bold text-slate-500 uppercase tracking-widest hover:text-emerald-600 px-2 py-1"
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-4 flex flex-col gap-3">
            <Link to="/login" className="w-full">
              <Button variant="outline" className="w-full text-xs font-bold uppercase tracking-widest h-12 rounded-2xl border-slate-200">Login</Button>
            </Link>
            <Link to="/signup" className="w-full">
              <Button className="w-full text-xs font-bold uppercase tracking-widest h-12 rounded-2xl bg-emerald-600">Get Started</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

