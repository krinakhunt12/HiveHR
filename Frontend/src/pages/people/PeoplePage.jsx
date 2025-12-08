import React, { useState } from 'react';
import { Users, Search, Filter } from 'lucide-react';
import UserTable from '../../components/people/UserTable';
import SearchBar from '../../components/people/SearchBar';
import DepartmentFilter from '../../components/people/DepartmentFilter';
import { usePeople } from '../../hooks/usePeople';
import DashboardLayout from '../../components/layout/DashboardLayout';

const PeoplePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const { users, departments, loading, error } = usePeople();

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment = 
      selectedDepartment === 'all' || user.department === selectedDepartment;

    const matchesStatus = 
      selectedStatus === 'all' || user.status === selectedStatus;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-white p-6">
          <div className="max-w-7xl mx-auto text-center py-12">
            <div className="text-red-600 text-lg">Failed to load people directory</div>
            <p className="text-gray-600 mt-2">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8 text-gray-700" />
              <h1 className="text-3xl font-bold text-gray-900">People Directory</h1>
            </div>
            <p className="text-gray-600">Find and connect with colleagues across the organization</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg border border-gray-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Users className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                  <p className="text-sm text-gray-600">Total Employees</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Filter className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
                  <p className="text-sm text-gray-600">Departments</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Search className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{filteredUsers.length}</p>
                  <p className="text-sm text-gray-600">Filtered Results</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-end gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search by name, email, role, or department..."
                />
              </div>

              {/* Department Filter */}
              <div className="w-full lg:w-64">
                <DepartmentFilter
                  departments={departments}
                  selectedDepartment={selectedDepartment}
                  onDepartmentChange={setSelectedDepartment}
                />
              </div>

              {/* Status Filter */}
              <div className="w-full lg:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="remote">Remote</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Reset Filters */}
              {(searchQuery || selectedDepartment !== 'all' || selectedStatus !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDepartment('all');
                    setSelectedStatus('all');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              Showing {filteredUsers.length} of {users.length} employees
            </p>
            <div className="text-sm text-gray-500">
              {searchQuery && `Search: "${searchQuery}"`}
              {searchQuery && selectedDepartment !== 'all' && ' • '}
              {selectedDepartment !== 'all' && `Department: ${selectedDepartment}`}
              {(searchQuery || selectedDepartment !== 'all') && selectedStatus !== 'all' && ' • '}
              {selectedStatus !== 'all' && `Status: ${selectedStatus}`}
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg border border-gray-300">
            <UserTable
              users={filteredUsers}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PeoplePage;