import { Link } from 'react-router-dom';
import { Users, Twitter, Linkedin, Instagram, Github } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="pt-24 pb-12 px-6 border-t border-slate-50 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-12 mb-16">
          <div className="col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-6 group w-fit">
                  <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Users className="text-white w-4.5 h-4.5" />
                  </div>
                  <span className="text-lg font-semibold text-[var(--color-text-main)] tracking-tight">HiveHr</span>
              </Link>
              <p className="text-sm font-medium text-slate-400 leading-relaxed mb-6 max-w-xs">
                  Building the infrastructure for modern organizational culture. Elegant tools for high-performance teams.
              </p>
              <div className="flex gap-4">
                  {[
                    { Icon: Twitter, href: 'https://twitter.com/hivehr' },
                    { Icon: Linkedin, href: 'https://linkedin.com/company/hivehr' },
                    { Icon: Instagram, href: 'https://instagram.com/hivehr' },
                    { Icon: Github, href: 'https://github.com/hivehr' }
                  ].map((item, i) => (
                      <a 
                        key={i} 
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-[var(--color-primary)] hover:bg-indigo-50 transition-all"
                      >
                          <item.Icon size={16} />
                      </a>
                  ))}
              </div>
          </div>
          
          <FooterCol 
            title="Product" 
            links={[
              { name: 'Features', href: '/#features' },
              { name: 'Integrations', href: '/integrations' },
              { name: 'Pricing', href: '/pricing' },
              { name: 'Documentation', href: '#' }
            ]} 
          />
          <FooterCol 
            title="Solutions" 
            links={[
              { name: 'Engineering', href: '/solutions' },
              { name: 'Product Teams', href: '/solutions' },
              { name: 'Startups', href: '/solutions' },
              { name: 'Enterprise', href: '/solutions' }
            ]} 
          />
          <FooterCol 
            title="Company" 
            links={[
              { name: 'About', href: '/#about' },
              { name: 'Careers', href: '#' },
              { name: 'Manifesto', href: '/#about' },
              { name: 'Privacy', href: '#' }
            ]} 
          />
          <FooterCol 
            title="Support" 
            links={[
              { name: 'Help Center', href: '#' },
              { name: 'API Status', href: '#' },
              { name: 'Security', href: '#' },
              { name: 'Contact', href: '/contact' }
            ]} 
          />
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
  );
};

const FooterCol = ({ title, links }: { title: string, links: { name: string, href: string }[] }) => (
  <div>
      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-950 mb-6">{title}</h4>
      <ul className="space-y-4">
          {links.map((link) => (
              <li key={link.name}>
                  <Link to={link.href} className="text-sm font-medium text-slate-400 hover:text-[var(--color-primary)] transition-colors tracking-tight">{link.name}</Link>
              </li>
          ))}
      </ul>
  </div>
);
