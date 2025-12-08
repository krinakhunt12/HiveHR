import React, { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import PerformanceForm from '../../components/performance/PerformanceForm';
import { usePerformance } from '../../hooks/usePerformance';
import { useToast } from '../../hooks/useToast';

const AddReview = () => {
  const [showForm, setShowForm] = useState(false);
  const { addReview } = usePerformance();
  const { showToast } = useToast();

  const handleSubmitReview = async (reviewData) => {
    try {
      await addReview(reviewData);
      setShowForm(false);
      showToast('Performance review submitted successfully!', 'success');
    } catch (error) {
      showToast('Failed to submit performance review', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gray-100 rounded-lg">
          <Plus className="w-6 h-6 text-gray-700" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Add Performance Review</h2>
          <p className="text-gray-600 text-sm">Create new performance evaluations for team members</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-gray-700" />
            <div>
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-sm text-gray-600">Team Members</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Plus className="w-8 h-8 text-gray-700" />
            <div>
              <p className="text-2xl font-bold text-gray-900">4</p>
              <p className="text-sm text-gray-600">Pending Reviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Review Button */}
      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
        <button
          onClick={() => setShowForm(true)}
          className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors mx-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Review
        </button>
        <p className="text-gray-600 text-sm mt-2">Click to start a new performance review</p>
      </div>

      {/* Performance Review Form Modal */}
      {showForm && (
        <PerformanceForm
          onSubmit={handleSubmitReview}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default AddReview;