import React, { useState } from 'react';
import { Dialog } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { useToast } from '@/shared/ui/toast/useToast';
import { usePolicyMutations } from '../hooks/usePolicies';
import { Save } from 'lucide-react';

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
        toast({ title: 'Policy Created', description: 'The new policy has been successfully registered.', type: 'success' });
        onClose();
        setFormData({ title: '', content: '', category: 'HR', is_mandatory: false });
      },

    });
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Register New Policy">
      <form onSubmit={handleSubmit} className="space-y-6 pt-4">
        <div className="space-y-4">
          <div className="space-y-2 text-left">
            <label className="text-sm font-medium">Policy Title</label>
            <Input
              required
              placeholder="e.g. Remote Work Guidelines"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2 text-left">
            <label className="text-sm font-medium">Category</label>
            <select
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="HR">HR</option>
              <option value="IT">IT</option>
              <option value="Security">Security</option>
              <option value="Attendance">Attendance</option>
            </select>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-sm font-medium">Content</label>
            <Textarea
              required
              placeholder="Enter detailed policy text..."
              className="min-h-[200px]"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="mandatory"
              checked={formData.is_mandatory}
              onChange={(e) => setFormData({ ...formData, is_mandatory: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="mandatory" className="text-sm font-medium">This policy is mandatory</label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" type="button" onClick={onClose} className="gap-2">
            Cancel
          </Button>
          <Button type="submit" className="gap-2" loading={create.isPending} loadingText="Saving...">
            <Save className="h-4 w-4" /> Save Policy
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
