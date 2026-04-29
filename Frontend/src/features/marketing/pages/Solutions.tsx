import MarketingLayout from '@/shared/layouts/MarketingLayout';

const Solutions = () => {
  return (
    <MarketingLayout>
      <section className="py-32 bg-slate-900 text-white overflow-hidden relative min-h-[60vh] flex items-center">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl lg:text-5xl font-semibold tracking-tight mb-6">Built for teams of all sizes.</h2>
            <p className="text-textSecondary text-lg max-w-2xl mx-auto">From small startups to large companies, HiveHr grows with you.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { id: 'farms', title: 'Large Farms', desc: 'Scale your large agricultural enterprise with robust HR tools.' },
              { id: 'seed', title: 'Seed Teams', desc: 'Move fast with simple tools designed for early-stage teams.' },
              { id: 'coops', title: 'Cooperatives', desc: 'Manage member resources and team coordination effectively.' },
              { id: 'enterprise', title: 'Agri-Enterprise', desc: 'Stay secure and compliant across global operations.' }
            ].map((sol) => (
              <div key={sol.id} id={sol.id} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                <h3 className="text-xl font-semibold mb-4 group-hover:text-indigo-400 transition-colors">{sol.title}</h3>
                <p className="text-sm text-textSecondary leading-relaxed font-medium">{sol.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-semibold mb-6">Designed for impact.</h2>
              <p className="text-textSecondary text-lg mb-8 leading-relaxed">
                We've spent thousands of hours researching how modern teams work. HiveHr is the result of that research—a tool that empowers employees while giving leadership the data they need.
              </p>
              <ul className="space-y-4">
                {['Advanced Permission Layers', 'Global Compliance Engine', 'Real-time Talent Insights'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm font-medium text-textSecondary">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="aspect-[4/3] bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 ">
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200"
                alt="Team working"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default Solutions;
