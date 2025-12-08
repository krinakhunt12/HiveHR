import React, { useState } from 'react';
import { X, User, Target, Award } from 'lucide-react';
import Modal from '../shared/Modal';
import RatingStars from './RatingStars';
import ProgressBar from './ProgressBar';

const PerformanceForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    period: '',
    overallRating: 0,
    goals: [{ description: '', progress: 0, rating: 0 }],
    achievements: '',
    areasForImprovement: '',
    comments: '',
    goalsProgress: 0
  });

  const employees = [
    { id: 'emp-001', name: 'Sarah Johnson', email: 'sarah.j@comline.com' },
    { id: 'emp-002', name: 'Mike Chen', email: 'mike.chen@comline.com' },
    { id: 'emp-003', name: 'Emily Davis', email: 'emily.d@comline.com' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGoalChange = (index, field, value) => {
    const updatedGoals = [...formData.goals];
    updatedGoals[index][field] = value;
    setFormData(prev => ({ ...prev, goals: updatedGoals }));
  };

  const addGoal = () => {
    setFormData(prev => ({
      ...prev,
      goals: [...prev.goals, { description: '', progress: 0, rating: 0 }]
    }));
  };

  const removeGoal = (index) => {
    if (formData.goals.length > 1) {
      const updatedGoals = formData.goals.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, goals: updatedGoals }));
    }
  };

  return (
    <Modal onClose={onCancel}>
      <div className="bg-white rounded-lg max-w-2xl w-full mx-auto p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Create Performance Review</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Employee
            </label>
            <select
              value={formData.employeeId}
              onChange={(e) => handleChange('employeeId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              required
            >
              <option value="">Choose an employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} - {emp.email}
                </option>
              ))}
            </select>
          </div>

          {/* Review Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Period
            </label>
            <select
              value={formData.period}
              onChange={(e) => handleChange('period', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              required
            >
              <option value="">Select period</option>
              <option value="Q1 2024">Q1 2024</option>
              <option value="Q2 2024">Q2 2024</option>
              <option value="Q3 2024">Q3 2024</option>
              <option value="Q4 2024">Q4 2024</option>
              <option value="Annual 2024">Annual 2024</option>
            </select>
          </div>

          {/* Overall Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Rating
            </label>
            <div className="flex items-center gap-4">
              <RatingStars 
                rating={formData.overallRating} 
                onRatingChange={(rating) => handleChange('overallRating', rating)}
                interactive={true}
              />
              <span className="text-sm text-gray-600">{formData.overallRating}/5</span>
            </div>
          </div>

          {/* Goals Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Goals & Objectives
              </label>
              <button
                type="button"
                onClick={addGoal}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                <Target className="w-4 h-4" />
                Add Goal
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.goals.map((goal, index) => (
                <div key={index} className="p-4 border border-gray-300 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-gray-700">Goal {index + 1}</span>
                    {formData.goals.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeGoal(index)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={goal.description}
                      onChange={(e) => handleGoalChange(index, 'description', e.target.value)}
                      placeholder="Goal description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      required
                    />
                    
                    <div>
                      <label className="block text-xs text-gray-600 mb-2">Progress</label>
                      <ProgressBar progress={goal.progress} />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={goal.progress}
                        onChange={(e) => handleGoalChange(index, 'progress', parseInt(e.target.value))}
                        className="w-full mt-2"
                      />
                      <div className="text-xs text-gray-500 text-right">{goal.progress}%</div>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-600 mb-2">Rating</label>
                      <RatingStars 
                        rating={goal.rating} 
                        onRatingChange={(rating) => handleGoalChange(index, 'rating', rating)}
                        interactive={true}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key Achievements
            </label>
            <textarea
              value={formData.achievements}
              onChange={(e) => handleChange('achievements', e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              placeholder="List key achievements and accomplishments..."
              required
            />
          </div>

          {/* Areas for Improvement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Areas for Improvement
            </label>
            <textarea
              value={formData.areasForImprovement}
              onChange={(e) => handleChange('areasForImprovement', e.target.value)}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              placeholder="Suggest areas for growth and development..."
            />
          </div>

          {/* Additional Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Comments
            </label>
            <textarea
              value={formData.comments}
              onChange={(e) => handleChange('comments', e.target.value)}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              placeholder="Any additional feedback or comments..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default PerformanceForm;