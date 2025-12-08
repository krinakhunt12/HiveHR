import React from 'react';
import { Calendar, User, Mail, Eye, Edit } from 'lucide-react';
import RatingStars from './RatingStars';
import ProgressBar from './ProgressBar';
import { formatDate } from '../../utils/performanceUtils';

const PerformanceTable = ({ 
  reviews, 
  loading, 
  showActions, 
  isManagerView = false 
}) => {
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading reviews...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="p-8 text-center">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No performance reviews found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-300">
          <tr>
            {isManagerView && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Review Period
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Overall Rating
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Goals Progress
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Updated
            </th>
            {showActions && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-300">
          {reviews.map((review) => (
            <tr key={review.id} className="hover:bg-gray-50 transition-colors">
              {isManagerView && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{review.employeeName}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {review.employeeEmail}
                      </p>
                    </div>
                  </div>
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {review.period}
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(review.reviewDate)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <RatingStars rating={review.overallRating} />
                <div className="text-xs text-gray-500 mt-1">
                  {review.overallRating}/5
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <ProgressBar progress={review.goalsProgress} />
                <div className="text-xs text-gray-500 mt-1">
                  {review.goalsProgress}% complete
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  review.status === 'completed' 
                    ? 'bg-gray-100 text-gray-800'
                    : review.status === 'draft'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {review.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(review.updatedAt)}
              </td>
              {showActions && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PerformanceTable;