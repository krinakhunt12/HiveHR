import React from 'react';
import { Target, Calendar, TrendingUp } from 'lucide-react';
import ProgressBar from './ProgressBar';

const GoalTracker = ({ goals }) => {
  const overallProgress = goals.length > 0 
    ? goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length 
    : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-300 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">My Goals Progress</h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{Math.round(overallProgress)}%</div>
          <div className="text-sm text-gray-600">Overall Progress</div>
        </div>
      </div>

      <div className="space-y-4">
        {goals.map((goal, index) => (
          <div key={index} className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{goal.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
              </div>
              <span className="text-sm font-medium text-gray-700">{goal.progress}%</span>
            </div>
            
            <ProgressBar progress={goal.progress} />
            
            <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Due: {goal.dueDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>{goal.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No goals set for current period</p>
          <p className="text-sm text-gray-500 mt-1">Contact your manager to set performance goals</p>
        </div>
      )}
    </div>
  );
};

export default GoalTracker;