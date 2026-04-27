import React, { useState } from 'react';
import { Dialog } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { useToast } from '@/shared/ui/toast/useToast';
import { usePolicyMutations } from '../hooks/usePolicies';
import { Save, FileText, LayoutGrid, Info } from 'lucide-react';

interface AddPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddPolicyModal = ({ isOpen, onClose }: AddPolicyModalProps) => {
  const { toast } = useToast();
  const { create } = usePolicyMutations();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'HR',
    is_mandatory: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate(formData, {
      onSuccess: () => {
        toast({ title: 'Policy Registered', description: 'The document has been added to the corporate handbook.', type: 'success' });
        onClose();
        setFormData({ title: '', content: '', category: 'HR', is_mandatory: false });
      },
      onError: (err: any) => {
        toast({ title: 'Registration Failed', description: err.message, type: 'error' });
      }
    });
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Register New Policy">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          <div className="space-y-2.5 text-left">
            <div className="flex items-center gap-2 mb-1">
              <FileText size={14} className="text-primary" />
              <label className="text-xs font-bold uppercase tracking-widest text-textSecondary">Document Title</label>
            </div>
            <Input 
              required
              placeholder="e.g. Remote Work Framework"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="h-12 px-4 rounded-xl border-border bg-surface/50 focus:bg-surface transition-all"
            />
          </div>

          <div className="space-y-2.5 text-left">
            <div className="flex items-center gap-2 mb-1">
              <LayoutGrid size={14} className="text-primary" />
              <label className="text-xs font-bold uppercase tracking-widest text-textSecondary">Classification</label>
            </div>
            <select
              className="w-full h-12 px-4 rounded-xl border border-border bg-surface/50 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="HR">HR & Personnel</option>
              <option value="IT">IT Infrastructure</option>
              <option value="Security">Security & Compliance</option>
              <option value="Attendance">Attendance Logistics</option>
            </select>
          </div>

          <div className="space-y-2.5 text-left">
            <div className="flex items-center gap-2 mb-1">
              <Info size={14} className="text-primary" />
              <label className="text-xs font-bold uppercase tracking-widest text-textSecondary">Policy Content</label>
            </div>
            <Textarea 
              required
              placeholder="Describe the terms, guidelines, and expectations..."
              className="min-h-[180px] p-4 rounded-xl border-border bg-surface/50 focus:bg-surface transition-all leading-relaxed"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
            <input 
              type="checkbox"
              id="mandatory"
              checked={formData.is_mandatory}
              onChange={(e) => setFormData({ ...formData, is_mandatory: e.target.checked })}
              className="h-5 w-5 rounded-md border-border text-primary focus:ring-primary transition-all cursor-pointer"
            />
            <label htmlFor="mandatory" className="text-sm font-bold text-primary/80 cursor-pointer">Require Mandatory Acknowledgement</label>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-border/40">
          <Button variant="ghost" type="button" onClick={onClose} className="h-12 px-8 rounded-xl font-bold">
            Dismiss
          </Button>
          <Button type="submit" className="h-12 px-10 rounded-xl font-bold gap-2 min-w-[160px]" disabled={create.isPending}>
            <Save size={18} /> {create.isPending ? 'Registering...' : 'Register Policy'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
