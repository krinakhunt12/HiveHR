import { Link } from 'react-router-dom';
import { Leaf, Twitter, Linkedin, Instagram, Github } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="pt-24 pb-12 px-6 border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-12 mb-20">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-8 group w-fit">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">
                <Leaf className="text-surface w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-textPrimary tracking-tight font-display">HiveHr</span>
            </Link>
            <p className="text-sm font-medium text-textSecondary leading-relaxed mb-8 max-w-xs">
              Building the future of team management. Empowering businesses with world-class HR tools.
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
                  className="p-3 bg-surface border border-border rounded-xl text-textSecondary hover:text-primary hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all"
                >
                  <item.Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <FooterCol
            title="Product"
            links={[
              { name: 'Features', href: '/#features' },
              { name: 'Integrations', href: '/integrations' },
              { name: 'Plans', href: '/pricing' },
              { name: 'Solutions', href: '/solutions' }
            ]}
          />
          <FooterCol
            title="Solutions"
            links={[
              { name: 'Large Farms', href: '/solutions' },
              { name: 'Seed Teams', href: '/solutions' },
              { name: 'Cooperatives', href: '/solutions' },
              { name: 'Agri-Enterprise', href: '/solutions' }
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              { name: 'About Us', href: '/#about' },
              { name: 'Careers', href: '#' },
              { name: 'Our Vision', href: '/#about' },
              { name: 'Security', href: '#' }
            ]}
          />
          <FooterCol
            title="Resources"
            links={[
              { name: 'Help Center', href: '#' },
              { name: 'System Status', href: '#' },
              { name: 'Privacy Policy', href: '#' },
              { name: 'Contact', href: '/contact' }
            ]}
          />
        </div>

        <div className="pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-medium text-textSecondary">© 2026 HiveHr Agriculture Infrastructure Inc.</p>
          <div className="flex gap-8">
            <a href="#" className="text-xs font-medium text-textSecondary hover:text-primary transition-colors hover:opacity-100">Privacy Policy</a>
            <a href="#" className="text-xs font-medium text-textSecondary hover:text-primary transition-colors hover:opacity-100">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterCol = ({ title, links }: { title: string, links: { name: string, href: string }[] }) => (
  <div className="text-left">
    <h4 className="text-base font-semibold text-textPrimary mb-8">{title}</h4>
    <ul className="space-y-4">
      {links.map((link) => (
        <li key={link.name}>
          <Link to={link.href} className="text-sm font-medium text-textSecondary hover:text-primary transition-colors hover:opacity-100">{link.name}</Link>
        </li>
      ))}
    </ul>
  </div>
);

