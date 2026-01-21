import React, { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import Modal from '../shared/Modal';
import { LEAVE_TYPES } from '../../constants/leaveConstants';

const LeaveForm = ({ onSubmit, onCancel, balances }) => {
  const [formData, setFormData] = useState({
    type: 'casual',
    startDate: '',
    endDate: '',
    reason: '',
    emergencyContact: ''
  });

  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validateLeave();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  const getRemainingBalance = (type) => {
    if (!balances) return 0;
    const totalKey = `${type}_leave_total`;
    const usedKey = `${type}_leave_used`;
    return (balances[totalKey] || 0) - (balances[usedKey] || 0);
  };

  const validateLeave = () => {
    const days = calculateDays();
    if (days <= 0) return "Invalid date range";

    const balance = getRemainingBalance(formData.type);
    // Skip check for 'other' or 'bereavement' if not tracked, but assume standard types are tracked
    if (['sick', 'casual', 'earned', 'maternity', 'paternity'].includes(formData.type)) {
      if (days > balance) {
        return `Insufficient leave balance. You have ${balance} days remaining for ${formData.type} leave.`;
      }
    }
    return null;
  };

  return (
    <Modal onClose={onCancel}>
      <div className="bg-white rounded-xl max-w-md w-full mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Apply for Leave</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Leave Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Leave Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {LEAVE_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                min={formData.startDate || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Duration Display */}
          {calculateDays() > 0 && (
            <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
              <Clock className="w-4 h-4" />
              <span>Total days: {calculateDays()} day(s)</span>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Please provide a reason for your leave..."
              required
            />
          </div>

          {/* Emergency Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emergency Contact
            </label>
            <input
              type="text"
              value={formData.emergencyContact}
              onChange={(e) => handleChange('emergencyContact', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Phone number for emergencies"
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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default LeaveForm;