import React, { useState } from 'react';
import { Edit, Save, X, Plus, Calendar } from 'lucide-react';

const LeavePolicyManager = ({ policies, loading }) => {
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [editedPolicies, setEditedPolicies] = useState({});

  const handleEdit = (policyId) => {
    setEditingPolicy(policyId);
    setEditedPolicies({
      ...editedPolicies,
      [policyId]: policies.find(p => p.id === policyId)
    });
  };

  const handleSave = (policyId) => {
    // In real app, this would call an API to update the policy
    setEditingPolicy(null);
    setEditedPolicies({});
  };

  const handleCancel = (policyId) => {
    setEditingPolicy(null);
    setEditedPolicies({});
  };

  const handleChange = (policyId, field, value) => {
    setEditedPolicies(prev => ({
      ...prev,
      [policyId]: {
        ...prev[policyId],
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-300 p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="text-gray-600 mt-2 text-center">Loading leave policies...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Leave Policy Management</h2>
        <p className="text-gray-600">Configure leave types and maximum limits for employees</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {policies?.map((policy) => (
          <div key={policy.id} className="bg-white rounded-lg border border-gray-300 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-700" />
                <h3 className="font-semibold text-gray-900">{policy.name}</h3>
              </div>
              {editingPolicy === policy.id ? (
                <div className="flex gap-1">
                  <button
                    onClick={() => handleSave(policy.id)}
                    className="text-green-600 hover:text-green-700 transition-colors p-1"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCancel(policy.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleEdit(policy.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Days
                </label>
                {editingPolicy === policy.id ? (
                  <input
                    type="number"
                    value={editedPolicies[policy.id]?.maxDays || policy.maxDays}
                    onChange={(e) => handleChange(policy.id, 'maxDays', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-900">{policy.maxDays} days</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carry Over
                </label>
                {editingPolicy === policy.id ? (
                  <input
                    type="number"
                    value={editedPolicies[policy.id]?.carryOver || policy.carryOver}
                    onChange={(e) => handleChange(policy.id, 'carryOver', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{policy.carryOver} days per year</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Notice
                </label>
                <p className="text-sm text-gray-900">{policy.minNotice} days</p>
              </div>

              {policy.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <p className="text-sm text-gray-600">{policy.description}</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Employees: {policy.employeeCount}</span>
                <span>Utilization: {policy.utilization}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Policy Button */}
      <div className="text-center">
        <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          <Plus className="w-4 h-4" />
          Add New Leave Policy
        </button>
      </div>
    </div>
  );
};

export default LeavePolicyManager;