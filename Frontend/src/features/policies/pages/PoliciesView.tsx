import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Separator } from '@/shared/ui/separator';
import { SkeletonPageHeader, SkeletonCard, SkeletonList } from '@/shared/ui/skeleton';
import { useToast } from '@/shared/ui/toast/useToast';
import { usePolicies, usePolicyMutations, type CompanyPolicy } from '../hooks/usePolicies';
import { Search, ChevronLeft, BookOpen, Clock, Laptop, Users, Lock, Plus, Trash2, ShieldAlert } from 'lucide-react';
import { AddPolicyModal } from '../components/AddPolicyModal';
import { ErrorState } from '@/shared/ui/ErrorState';
import { EmptyState } from '@/shared/ui/EmptyState';

const CATEGORIES = [
  { id: 'all', name: 'All Policies', icon: BookOpen },
  { id: 'HR', name: 'HR', icon: Users },
  { id: 'IT', name: 'IT', icon: Laptop },
  { id: 'Security', name: 'Security', icon: Lock },
  { id: 'Attendance', name: 'Attendance', icon: Clock },
];

export const PoliciesView = ({ isAdmin = false }: { isAdmin?: boolean }) => {
  const { data: policies = [], isLoading, error, refetch } = usePolicies();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingPolicy, setViewingPolicy] = useState<CompanyPolicy | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredPolicies = policies.filter((p) => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 space-y-8">
        <SkeletonPageHeader />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <SkeletonCard hasHeader={false} lines={5} />
          </div>
          <div className="md:col-span-3">
            <SkeletonList count={6} className="grid-cols-1 sm:grid-cols-2" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorState 
          error={error} 
          onRetry={refetch} 
          title="Policy Repository Unavailable"
          description="We encountered an error while fetching the corporate handbook."
        />
      </div>
    );
  }

  if (viewingPolicy) {
    return <PolicyDetail policy={viewingPolicy} onBack={() => setViewingPolicy(null)} />;
  }

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-textPrimary">Policies</h1>
          <p className="text-sm font-medium text-textSecondary mt-1.5">Review and acknowledge company guidelines.</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-textSecondary" />
            <Input
              placeholder="Search by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-xl border-border bg-surface"
            />
          </div>
          {isAdmin && (
            <Button size="lg" className="h-11 px-6 rounded-xl font-semibold gap-2" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4" /> Add Policy
            </Button>
          )}
        </div>
      </div>

      <Separator className="bg-border/60" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="space-y-4">
          <Card className="p-2 overflow-hidden rounded-2xl">
            <div className="space-y-1">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.id}
                  variant={activeCategory === cat.id ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-11 rounded-xl font-medium",
                    activeCategory === cat.id ? "shadow-md" : "text-textSecondary"
                  )}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <cat.icon className="h-4 w-4" />
                  {cat.name}
                </Button>
              ))}
            </div>
          </Card>
        </aside>

        {/* Content */}
        <main className="md:col-span-3">
          {filteredPolicies.length === 0 ? (
            <EmptyState 
              title={searchQuery ? "No policies found" : "No policies registered"}
              description={searchQuery ? `No documents match "${searchQuery}".` : "The corporate handbook is empty."}
              icon={BookOpen}
              action={
                <Button variant="outline" onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}>
                  Clear Filters
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredPolicies.map((policy) => (
                <PolicyCard
                  key={policy.id}
                  policy={policy}
                  isAdmin={isAdmin}
                  onView={() => setViewingPolicy(policy)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
      <AddPolicyModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
};

const PolicyCard = ({ policy, onView, isAdmin }: { policy: CompanyPolicy, onView: () => void, isAdmin: boolean }) => {
  const { acknowledge, remove } = usePolicyMutations();
  const { toast } = useToast();
  const isNew = new Date(policy.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const handleDelete = async () => {
    try {
      await remove.mutateAsync(policy.id);
      toast({ title: 'Policy Deleted', description: 'The document has been removed.', type: 'success' });
    } catch (err: any) {
      toast({ title: 'Delete Failed', description: err.message, type: 'error' });
    }
  };

  return (
    <Card className="flex flex-col h-full transition-all duration-300 hover:shadow-lg group border-border/60 rounded-2xl overflow-hidden">
      <CardHeader className="p-6 space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex gap-2">
            {policy.is_mandatory && <Badge variant="destructive" className="font-bold">Mandatory</Badge>}
            {isNew && <Badge variant="secondary" className="font-bold">New</Badge>}
          </div>
          {isAdmin && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-textSecondary hover:text-error hover:bg-error/5 opacity-0 group-hover:opacity-100 transition-opacity" 
              onClick={(e) => { e.stopPropagation(); handleDelete(); }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardTitle className="text-xl font-bold tracking-tight text-textPrimary leading-tight line-clamp-1">{policy.title}</CardTitle>
        <CardDescription className="text-sm font-medium text-textSecondary line-clamp-3 leading-relaxed">
          {policy.content}
        </CardDescription>
      </CardHeader>
      <CardFooter className="p-6 pt-0 mt-auto flex gap-3">
        <Button variant="default" className="flex-1 h-10 rounded-xl font-semibold" onClick={onView}>View Document</Button>
        {!isAdmin && (
          <Button
            variant="outline"
            className="flex-1 h-10 rounded-xl font-semibold"
            disabled={acknowledge.isPending}
            onClick={() => acknowledge.mutate(policy.id)}
          >
            {acknowledge.isPending ? 'Processing...' : 'Acknowledge'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

const PolicyDetail = ({ policy, onBack }: { policy: CompanyPolicy, onBack: () => void }) => {
  const { acknowledge } = usePolicyMutations();

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto space-y-8 animate-in slide-in-from-left-4 duration-500">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 -ml-2 text-textSecondary hover:text-textPrimary">
        <ChevronLeft className="h-4 w-4" /> Back to Directory
      </Button>

      <Card className="rounded-3xl overflow-hidden shadow-xl border-border/40">
        <CardHeader className="p-8 md:p-12 space-y-6 bg-slate-50/50 dark:bg-slate-900/50 border-b border-border/40">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="px-3 py-1 rounded-full bg-background font-bold tracking-wider">{policy.category}</Badge>
            <span className="text-xs font-bold text-textSecondary tracking-widest uppercase">Version {policy.version}.0</span>
          </div>
          <CardTitle className="text-3xl md:text-4xl font-bold tracking-tighter text-textPrimary leading-none">{policy.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-8 md:p-12">
          <div className="prose prose-lg max-w-none text-textPrimary/80 leading-relaxed space-y-6">
            {policy.content.split('\n').filter(Boolean).map((para, i) => (
              <p key={i} className="text-base font-medium">{para}</p>
            ))}
          </div>
        </CardContent>
        <CardFooter className="p-8 md:p-12 bg-slate-50/50 dark:bg-slate-900/50 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-xs font-bold text-textSecondary">
            <Clock size={14} />
            <span>Updated {new Date(policy.updated_at).toLocaleDateString()}</span>
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <Button variant="ghost" className="h-12 px-8 rounded-xl font-bold" onClick={onBack}>Dismiss</Button>
            <Button
              className="h-12 px-10 rounded-xl font-bold flex-1 sm:flex-none"
              disabled={acknowledge.isPending}
              onClick={() => acknowledge.mutate(policy.id)}
            >
              {acknowledge.isPending ? 'Validating...' : 'Acknowledge Document'}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
