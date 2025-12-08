import React, { useState } from 'react';
import { Mail, Phone, MapPin, Building, Calendar } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { generateInitials } from '../../utils/peopleUtils';

const UserCard = ({ user, onViewProfile }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="bg-white rounded-lg border border-gray-300 p-4 hover:shadow-md transition-all cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewProfile(user)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-sm font-semibold text-gray-700">
              {generateInitials(user.name)}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
              user.status === 'active' ? 'bg-green-500' :
              user.status === 'remote' ? 'bg-blue-500' : 'bg-gray-400'
            }`} />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-500">{user.role}</p>
          </div>
        </div>
        <StatusBadge status={user.status} />
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4" />
          <span>{user.department}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>Joined {user.joinDate}</span>
        </div>
        {user.location && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{user.location}</span>
          </div>
        )}
      </div>

      {(isHovered || user.email) && (
        <div className="flex items-center gap-3 pt-3 mt-3 border-t border-gray-200">
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
      )}
    </div>
  );
};

export default UserCard;