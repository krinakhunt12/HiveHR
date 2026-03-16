import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Menu, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-white/70 backdrop-blur-md z-50 border-b border-slate-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center shrink-0 shadow-sm shadow-indigo-100">
              <Users className="text-white w-4.5 h-4.5" />
            </div>
            <span className="text-lg font-semibold text-[var(--color-text-main)] tracking-tight">HiveHr</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            {[
              { name: 'Features', path: '/#features' },
              { name: 'Integrations', path: '/integrations' },
              { name: 'Solutions', path: '/solutions' },
              { name: 'Pricing', path: '/pricing' },
              { name: 'Contact', path: '/contact' }
            ].map((item) => (
              <Link 
                key={item.name} 
                to={item.path} 
                className="text-sm font-medium text-slate-500 hover:text-[var(--color-primary)] transition-colors"
              >
                {item.name}
              </Link>
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
          {[
            { name: 'Features', path: '/#features' },
            { name: 'Integrations', path: '/integrations' },
            { name: 'Solutions', path: '/solutions' },
            { name: 'Pricing', path: '/pricing' },
            { name: 'Contact', path: '/contact' }
          ].map((item) => (
            <Link 
              key={item.name} 
              to={item.path} 
              onClick={() => setIsMenuOpen(false)} 
              className="block text-sm font-medium text-slate-500"
            >
              {item.name}
            </Link>
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
  );
};
