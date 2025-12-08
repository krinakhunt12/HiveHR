import React from 'react';
import { Building } from 'lucide-react';

const DepartmentFilter = ({ departments, selectedDepartment, onDepartmentChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Department
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Building className="h-4 w-4 text-gray-400" />
        </div>
        <select
          value={selectedDepartment}
          onChange={(e) => onDepartmentChange(e.target.value)}
          className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
        >
          <option value="all">All Departments</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.name}>
              {dept.name} ({dept.employeeCount})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DepartmentFilter;