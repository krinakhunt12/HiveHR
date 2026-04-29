import { useState } from 'react';
import { cn } from '@/shared/utils/cn';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Separator } from '@/shared/ui/separator';
import { Skeleton } from '@/shared/ui/skeleton';
import { useToast } from '@/shared/ui/toast/useToast';
import { ErrorState } from '@/shared/ui/ErrorState';
import { usePolicies, usePolicyMutations, type CompanyPolicy } from '../hooks/usePolicies';
import { POLICY_CATEGORIES } from '@/shared/constants';
import { Search, ChevronLeft, Plus, Trash2 } from 'lucide-react';
import { AddPolicyModal } from '../components/AddPolicyModal';
import { ConfirmModal } from '@/shared/ui/ConfirmModal';

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
      <div className="space-y-6 animate-pulse">
        <div className="space-y-2">
          <Skeleton className="h-9 w-56 rounded-xl" />
          <Skeleton className="h-4 w-72 rounded-lg opacity-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Filter Skeleton */}
          <aside className="space-y-4">
            <div className="p-2 border rounded-lg bg-surface space-y-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md opacity-60" />
              ))}
            </div>
          </aside>

          {/* Policy Cards Grid Skeleton */}
          <main className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col h-64 rounded-lg border bg-surface p-6 space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-20 rounded-full opacity-30" />
                  <Skeleton className="h-5 w-5 rounded-md opacity-20" />
                </div>
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-3/4 rounded-md" />
                  <Skeleton className="h-3 w-1/4 rounded-md opacity-40" />
                  <div className="pt-4 space-y-2">
                    <Skeleton className="h-3 w-full rounded-md opacity-30" />
                    <Skeleton className="h-3 w-5/6 rounded-md opacity-30" />
                  </div>
                </div>
                <div className="pt-4 border-t flex justify-between items-center">
                  <Skeleton className="h-3 w-24 rounded-md opacity-40" />
                  <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
              </div>
            ))}
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <ErrorState
          error={error as Error}
          onRetry={() => refetch()}
          title="Failed to load policies"
        />
      </div>
    );
  }

  if (viewingPolicy) {
    return <PolicyDetail policy={viewingPolicy} onBack={() => setViewingPolicy(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Policies</h1>
          <p className="text-sm font-medium text-textSecondary mt-1">Review and acknowledge company guidelines.</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-textSecondary" />
            <Input
              placeholder="Search policies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {isAdmin && (
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4" /> Add Policy
            </Button>
          )}
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="space-y-4">
          <Card className="p-2 border border-border shadow-sm bg-white">
            <div className="p-4 border-b border-border mb-2">
              <h4 className="text-sm font-medium text-textSecondary uppercase">Filter by Category</h4>
            </div>
            <div className="space-y-1">
              {POLICY_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "w-full text-left px-4 py-2.5 rounded-md text-sm font-medium capitalize transition-all flex items-center gap-3",
                    activeCategory === cat.id
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-textSecondary hover:text-textPrimary hover:bg-background"
                  )}
                >
                  <cat.icon className="h-4 w-4" />
                  {cat.name}
                </button>
              ))}
            </div>
          </Card>
        </aside>

        {/* Content */}
        <main className="md:col-span-3">
          {filteredPolicies.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
              <p className="text-sm font-medium text-textSecondary leading-relaxed mb-4">No policies found matching your criteria.</p>
              <Button variant="outline" size="sm" onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}>
                Clear Filters
              </Button>
            </Card>
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

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await remove.mutateAsync(policy.id);
      toast({ title: 'Policy Deleted', description: 'The policy has been removed.', type: 'success' });
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      // Error handled by QueryProvider
    }
  };

  return (
    <>
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Policy"
        description={`Are you sure you want to delete "${policy.title}"? This action cannot be undone.`}
        isLoading={remove.isPending}
        confirmText="Delete"
        variant="destructive"
      />
      <Card className="flex flex-col h-full transition-colors hover:bg-accent/5">
      <CardHeader className="p-4 md:p-6 space-y-2">
        <div className="flex justify-between items-start">
          <div className="flex gap-2">
            {policy.is_mandatory && <Badge variant="destructive" className='font-medium'>Mandatory</Badge>}
            {isNew && <Badge variant="secondary" className='font-medium'>New</Badge>}
          </div>
          {isAdmin && (
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors" 
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <CardTitle className="text-lg font-semibold line-clamp-1">{policy.title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground line-clamp-2">
          {policy.content}
        </CardDescription>
      </CardHeader>
      <CardFooter className="p-4 md:p-6 pt-0 mt-auto flex gap-2">
        <Button variant="default" size="sm" className="flex-1" onClick={onView}>View</Button>
        {!isAdmin && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            loading={acknowledge.isPending}
            loadingText="Acknowledging..."
            onClick={() => acknowledge.mutate(policy.id)}
          >
            Acknowledge
          </Button>
        )}
      </CardFooter>
      </Card>
    </>
  );
};

const PolicyDetail = ({ policy, onBack }: { policy: CompanyPolicy, onBack: () => void }) => {
  // const { acknowledge } = usePolicyMutations();

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 -ml-2">
        <ChevronLeft className="h-4 w-4" /> Back to Policies
      </Button>

      <Card>
        <CardHeader className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="capitalize">{policy.category}</Badge>
            <span className="text-xs text-muted-foreground">Version {policy.version}</span>
          </div>
          <CardTitle className="text-xl font-semibold">{policy.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-6 py-0">
          <div className="prose prose-sm max-w-none text-foreground leading-relaxed space-y-4">
            {policy.content.split('\n').filter(Boolean).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </CardContent>
        <CardFooter className="p-6 mt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">Last updated {new Date(policy.updated_at).toLocaleDateString()}</p>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" type="button" onClick={onBack} className="gap-2">
              Cancel
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
