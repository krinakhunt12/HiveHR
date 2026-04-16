import MarketingLayout from '@/shared/layouts/MarketingLayout';
import { Button } from '@/shared/ui/button';

const Integrations = () => {
  return (
    <MarketingLayout>
      <section className="py-24 bg-white">
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
              <div className="mt-12">
                <Button size="lg" className="px-8">View All 150+ Integrations</Button>
              </div>
            </div>
            <div className="lg:w-1/2 grid grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <div key={i} className="aspect-square rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center hover:scale-105 transition-transform shadow-sm">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-50"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Additional content for the full page */}
      <section className="py-24 bg-slate-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-semibold">Developer-first API</h2>
            <p className="text-slate-500 mt-2">Build custom integrations with nuestra robust REST API.</p>
          </div>
          <div className="bg-slate-900 rounded-3xl p-8 lg:p-12 text-white">
            <pre className="text-sm text-indigo-300 overflow-x-auto">
              {`curl -X GET "https://api.hivehr.io/v1/integrations" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
            </pre>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default Integrations;
