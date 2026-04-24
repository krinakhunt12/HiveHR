import { useState } from 'react';
import { 
  ShieldCheck, 
  Info, 
  FileText, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  Search,
  Plus
} from 'lucide-react';
import { usePolicies, usePolicyMutations, type CompanyPolicy } from '../hooks/usePolicies';
import { SkeletonCard, SkeletonText } from '@/shared/ui/skeleton';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/utils/cn';
import { useToast } from '@/shared/ui/toast/useToast';

const CATEGORIES = ['All', 'HR Rules', 'Work Guidelines', 'Code of Conduct', 'Attendance', 'Security'];

export const PoliciesView = ({ isAdmin = false }: { isAdmin?: boolean }) => {
  const { data: policies = [], isLoading } = usePolicies();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
  
  const filteredPolicies = policies.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedPolicy = policies.find(p => p.id === selectedPolicyId);

  if (isLoading) {
    return (
      <div className="space-y-10 text-left">
        <div className="flex justify-between items-end">
          <SkeletonText lines={2} className="w-96" />
          <div className="flex gap-3">
             <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse" />
             <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 pt-4">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-textPrimary font-display">Governance & Guidelines</h1>
          <p className="text-sm font-semibold text-textSecondary mt-1.5 opacity-60">
            Official company documentation, ethics, and operational protocols.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Search protocols..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-11 w-64 bg-surface border border-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/40 outline-none text-sm transition-all"
            />
          </div>
          {isAdmin && (
            <Button className="gap-2 px-6 h-11 text-xs font-bold uppercase tracking-widest shadow-xl shadow-primary/20">
              <Plus size={18} /> New Policy
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Sidebar Categories */}
        <aside className="space-y-2">
          <p className="text-[10px] font-black text-textSecondary uppercase tracking-[0.2em] mb-4 ml-4 opacity-40">Categories</p>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group",
                selectedCategory === cat 
                  ? "bg-primary/10 text-primary border border-primary/5" 
                  : "text-textSecondary hover:bg-surface hover:text-textPrimary border border-transparent"
              )}
            >
              <span className="text-sm font-bold tracking-tight">{cat}</span>
              {selectedCategory === cat && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
              {selectedCategory !== cat && <ChevronRight size={14} className="opacity-0 group-hover:opacity-40 transition-opacity" />}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {filteredPolicies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-surface rounded-[2rem] border border-dashed border-border/60">
              <div className="p-4 bg-primary/5 rounded-2xl mb-4">
                <FileText size={32} className="text-primary/40" />
              </div>
              <h3 className="text-lg font-bold text-textPrimary">No documentation found</h3>
              <p className="text-sm text-textSecondary mt-1 opacity-60">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPolicies.map((policy) => (
                <PolicyCard 
                  key={policy.id} 
                  policy={policy} 
                  onClick={() => setSelectedPolicyId(policy.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Policy Detail Modal */}
      {selectedPolicy && (
        <PolicyDetailModal 
          policy={selectedPolicy} 
          onClose={() => setSelectedPolicyId(null)} 
        />
      )}
    </div>
  );
};

const PolicyCard = ({ policy, onClick }: { policy: CompanyPolicy, onClick: () => void }) => {
  const isNew = new Date(policy.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  return (
    <div 
      onClick={onClick}
      className="card-premium group p-8 bg-white hover:border-primary/20 transition-all cursor-pointer text-left flex flex-col justify-between min-h-[240px]"
    >
      <div>
        <div className="flex items-start justify-between mb-6">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors",
            policy.is_mandatory ? "bg-error/5 text-error border-error/10" : "bg-primary/5 text-primary border-primary/10"
          )}>
            {policy.category === 'Security' ? <ShieldCheck size={24} /> : <Info size={24} />}
          </div>
          <div className="flex gap-2">
            {policy.is_mandatory && (
              <span className="px-2.5 py-1 bg-error/5 text-error text-[10px] font-black uppercase tracking-widest border border-error/10 rounded-lg">
                Mandatory
              </span>
            )}
            {isNew && (
              <span className="px-2.5 py-1 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10 rounded-lg">
                New
              </span>
            )}
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-textPrimary group-hover:text-primary transition-colors tracking-tight mb-2">
          {policy.title}
        </h3>
        <p className="text-sm text-textSecondary line-clamp-3 leading-relaxed opacity-70">
          {policy.content}
        </p>
      </div>

      <div className="flex items-center justify-between pt-8 border-t border-border/40 mt-8">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-textSecondary opacity-40">
          <Clock size={12} />
          <span>v{policy.version} • {new Date(policy.updated_at).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
          View Detail <ChevronRight size={14} />
        </div>
      </div>
    </div>
  );
};

const PolicyDetailModal = ({ policy, onClose }: { policy: CompanyPolicy, onClose: () => void }) => {
  const { acknowledge } = usePolicyMutations();
  const { toast } = useToast();

  const handleAcknowledge = async () => {
    try {
      await acknowledge.mutateAsync(policy.id);
      toast({
        title: "Policy Acknowledged",
        description: "Your acknowledgement has been recorded in the enterprise registry.",
        type: "success"
      });
      onClose();
    } catch (err: any) {
      toast({
        title: "Action Failed",
        description: err.message,
        type: "error"
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 text-left flex flex-col max-h-[90vh]"
      >
        <div className="p-10 border-b border-border/40 shrink-0">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
               <div className={cn(
                 "w-14 h-14 rounded-2xl flex items-center justify-center border",
                 policy.is_mandatory ? "bg-error/5 text-error border-error/10" : "bg-primary/5 text-primary border-primary/10"
               )}>
                 {policy.is_mandatory ? <ShieldCheck size={28} /> : <Info size={28} />}
               </div>
               <div>
                  <div className="flex gap-2 mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{policy.category}</span>
                    {policy.is_mandatory && <span className="text-[10px] font-black uppercase tracking-[0.2em] text-error">• Required</span>}
                  </div>
                  <h2 className="text-2xl font-bold text-textPrimary tracking-tight">{policy.title}</h2>
               </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-12 w-12 hover:bg-slate-100">
              <Plus size={24} className="rotate-45" />
            </Button>
          </div>
        </div>

        <div className="p-10 overflow-y-auto flex-1 prose prose-slate prose-sm max-w-none">
          <div className="text-textSecondary leading-loose text-base space-y-6">
            {policy.content.split('\n').map((para: string, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          
          {policy.is_mandatory && (
            <div className="mt-12 p-6 bg-error/5 border border-error/10 rounded-2xl flex items-start gap-4">
              <CheckCircle2 size={20} className="text-error shrink-0 mt-1" />
              <div>
                <p className="text-sm font-bold text-error">Mandatory Acknowledgement</p>
                <p className="text-xs text-error/70 mt-1 leading-relaxed">
                  By clicking acknowledge, you confirm that you have read, understood, and agreed to comply with this policy in its entirety.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-10 border-t border-border/40 bg-slate-50/50 flex items-center justify-between shrink-0">
          <div className="text-xs font-bold text-textSecondary opacity-40 uppercase tracking-widest">
            Last Updated: {new Date(policy.updated_at).toLocaleDateString()}
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={onClose} className="px-8 rounded-xl h-12 text-xs font-black uppercase tracking-widest">
              Close
            </Button>
            <Button 
              loading={acknowledge.isPending}
              onClick={handleAcknowledge}
              className="px-10 rounded-xl h-12 text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20"
            >
              Acknowledge Policy
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
