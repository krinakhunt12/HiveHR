import React from 'react';
import { X, Mail, Phone, MapPin, Building, Calendar, User, Shield } from 'lucide-react';
import Modal from '../shared/Modal';
import StatusBadge from './StatusBadge';
import { generateInitials } from '../../utils/peopleUtils';

const ProfileCard = ({ user, onClose }) => {
  return (
    <Modal onClose={onClose}>
      <div className="bg-white rounded-lg max-w-2xl w-full mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xl font-semibold text-gray-700">
                {generateInitials(user.name)}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                user.status === 'active' ? 'bg-green-500' :
                user.status === 'remote' ? 'bg-blue-500' : 'bg-gray-400'
              }`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">{user.role}</p>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={user.status} />
                <span className="text-sm text-gray-500">• {user.employeeId}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Contact & Work Info */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <a href={`mailto:${user.email}`} className="text-gray-900 hover:text-gray-700">
                      {user.email}
                    </a>
                  </div>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <a href={`tel:${user.phone}`} className="text-gray-900 hover:text-gray-700">
                        {user.phone}
                      </a>
                    </div>
                  </div>
                )}
                {user.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="text-gray-900">{user.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Work Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="text-gray-900">{user.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="text-gray-900">{user.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Join Date</p>
                    <p className="text-gray-900">{user.joinDate}</p>
                  </div>
                </div>
                {user.manager && (
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Manager</p>
                      <p className="text-gray-900">{user.manager}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Additional Info & Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <a
                  href={`mailto:${user.email}`}
                  className="w-full flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-300 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Send Email
                </a>
                {user.phone && (
                  <a
                    href={`tel:${user.phone}`}
                    className="w-full flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-300 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Call Phone
                  </a>
                )}
              </div>
            </div>

            {/* Additional Information */}
            {user.skills && user.skills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {user.projects && user.projects.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Projects</h3>
                <div className="space-y-2">
                  {user.projects.map((project, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      • {project}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ProfileCard;