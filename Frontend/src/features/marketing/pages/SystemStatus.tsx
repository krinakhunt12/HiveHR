import { SimpleMarketingPage } from '@/shared/components/SimpleMarketingPage';

const SystemStatus = () => (
    <SimpleMarketingPage 
        title="System Status"
        description="Real-time updates on our system performance and reliability."
        content={
            <div className="space-y-8">
                <div className="p-8 rounded-2xl bg-success/5 border border-success/20 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-success mb-1">All Systems Operational</h3>
                        <p className="text-sm text-success/70">Last checked: Just now</p>
                    </div>
                    <div className="w-4 h-4 rounded-full bg-success animate-pulse"></div>
                </div>
                <div className="space-y-4">
                    {[
                        { name: 'Web Dashboard', status: 'Operational' },
                        { name: 'Mobile Application', status: 'Operational' },
                        { name: 'API Services', status: 'Operational' },
                        { name: 'Database Clusters', status: 'Operational' }
                    ].map(service => (
                        <div key={service.name} className="flex justify-between items-center py-4 border-b border-border">
                            <span className="font-bold text-textPrimary">{service.name}</span>
                            <span className="text-xs font-bold text-success uppercase">{service.status}</span>
                        </div>
                    ))}
                </div>
            </div>
        }
    />
);

export default SystemStatus;
