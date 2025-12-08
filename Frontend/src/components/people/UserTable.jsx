import React, { useState } from 'react';
import { Mail, Phone, MapPin, Building, User, ChevronDown, ChevronRight } from 'lucide-react';
import ProfileCard from './ProfileCard';
import StatusBadge from './StatusBadge';
import { generateInitials } from '../../utils/peopleUtils';

const UserTable = ({ users, loading }) => {
  const [expandedUser, setExpandedUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading people directory...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-8 text-center">
        <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No employees found</p>
        <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
      </div>
    );
  }

  const toggleExpand = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-300">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                {/* Expand column */}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-300">
            {users.map((user) => (
              <React.Fragment key={user.id}>
                {/* Main Row */}
                <tr 
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => toggleExpand(user.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      {expandedUser === user.id ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-semibold text-gray-700">
                          {generateInitials(user.name)}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          user.status === 'active' ? 'bg-green-500' :
                          user.status === 'remote' ? 'bg-blue-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p 
                            className="text-sm font-medium text-gray-900 hover:text-gray-700 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUser(user);
                            }}
                          >
                            {user.name}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">{user.employeeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{user.role}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{user.department}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <a
                        href={`mailto:${user.email}`}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                      {user.phone && (
                        <a
                          href={`tel:${user.phone}`}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>

                {/* Expanded Details Row */}
                {expandedUser === user.id && (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Contact Information */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Contact Information</h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <a href={`mailto:${user.email}`} className="text-sm text-gray-600 hover:text-gray-900">
                                {user.email}
                              </a>
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <a href={`tel:${user.phone}`} className="text-sm text-gray-600 hover:text-gray-900">
                                  {user.phone}
                                </a>
                              </div>
                            )}
                            {user.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{user.location}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Work Information */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Work Information</h4>
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-gray-500">Employee ID</p>
                              <p className="text-sm text-gray-900">{user.employeeId}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Join Date</p>
                              <p className="text-sm text-gray-900">{user.joinDate}</p>
                            </div>
                            {user.manager && (
                              <div>
                                <p className="text-xs text-gray-500">Manager</p>
                                <p className="text-sm text-gray-900">{user.manager}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
                          <div className="space-y-2">
                            <button
                              onClick={() => setSelectedUser(user)}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              View Full Profile
                            </button>
                            <a
                              href={`mailto:${user.email}`}
                              className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              Send Email
                            </a>
                            {user.phone && (
                              <a
                                href={`tel:${user.phone}`}
                                className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                Call Phone
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Profile Card Modal */}
      {selectedUser && (
        <ProfileCard
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </>
  );
};

export default UserTable;