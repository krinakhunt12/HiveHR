import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Separator } from '@/shared/ui/separator';
import { SkeletonCard } from '@/shared/ui/skeleton';
import { useToast } from '@/shared/ui/toast/useToast';
import { usePolicies, usePolicyMutations, type CompanyPolicy } from '../hooks/usePolicies';
import { Search, ChevronLeft, BookOpen, Clock, Laptop, Users, Lock, Plus, Trash2 } from 'lucide-react';
import { AddPolicyModal } from '../components/AddPolicyModal';

const CATEGORIES = [
  { id: 'all', name: 'All Policies', icon: BookOpen },
  { id: 'HR', name: 'HR', icon: Users },
  { id: 'IT', name: 'IT', icon: Laptop },
  { id: 'Security', name: 'Security', icon: Lock },
  { id: 'Attendance', name: 'Attendance', icon: Clock },
];

export const PoliciesView = ({ isAdmin = false }: { isAdmin?: boolean }) => {
  const { data: policies = [], isLoading } = usePolicies();
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
      <div>
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted animate-pulse rounded-md" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-4">
            <SkeletonCard hasHeader={false} lines={5} />
          </div>
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        </div>
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search policies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
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
          <Card className="p-2 border-none shadow-none md:border md:shadow-sm">
            <div className="space-y-1">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.id}
                  variant={activeCategory === cat.id ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2"
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
            <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
              <p className="text-sm text-textSecondary mb-4">No policies found matching your criteria.</p>
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

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${policy.title}"?`)) return;
    try {
      await remove.mutateAsync(policy.id);
      toast({ title: 'Policy Deleted', description: 'The policy has been removed.', type: 'success' });
    } catch (err: any) {
      toast({ title: 'Delete Failed', description: err.message, type: 'error' });
    }
  };

  return (
    <Card className="flex flex-col h-full transition-colors hover:bg-accent/5">
      <CardHeader className="p-4 md:p-6 space-y-2">
        <div className="flex justify-between items-start">
          <div className="flex gap-2">
            {policy.is_mandatory && <Badge variant="destructive">Mandatory</Badge>}
            {isNew && <Badge variant="secondary">New</Badge>}
          </div>
          {isAdmin && (
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={handleDelete}>
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
            disabled={acknowledge.isPending}
            onClick={() => acknowledge.mutate(policy.id)}
          >
            Acknowledge
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

const PolicyDetail = ({ policy, onBack }: { policy: CompanyPolicy, onBack: () => void }) => {
  const { acknowledge } = usePolicyMutations();

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
            <Button variant="ghost" size="sm" onClick={onBack}>Cancel</Button>
            <Button
              variant="default"
              size="sm"
              disabled={acknowledge.isPending}
              onClick={() => acknowledge.mutate(policy.id)}
            >
              {acknowledge.isPending ? 'Acknowledging...' : 'Acknowledge Policy'}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
