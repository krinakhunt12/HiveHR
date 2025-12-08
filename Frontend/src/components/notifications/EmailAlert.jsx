import React from 'react';
import { Mail, Bell, Settings } from 'lucide-react';

const EmailAlert = () => {
  const [emailEnabled, setEmailEnabled] = useState(true);

  return (
    <div className="bg-white rounded-lg border border-gray-300 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Mail className="w-6 h-6 text-gray-700" />
        <h3 className="text-lg font-semibold text-gray-900">Email Notifications</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Leave Approvals/Rejections</p>
            <p className="text-sm text-gray-600">Get notified when your leave requests are processed</p>
          </div>
          <input
            type="checkbox"
            checked={emailEnabled}
            onChange={(e) => setEmailEnabled(e.target.checked)}
            className="rounded border-gray-300 text-gray-900 focus:ring-gray-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Performance Reviews</p>
            <p className="text-sm text-gray-600">Notifications for new review assignments</p>
          </div>
          <input
            type="checkbox"
            checked={emailEnabled}
            onChange={(e) => setEmailEnabled(e.target.checked)}
            className="rounded border-gray-300 text-gray-900 focus:ring-gray-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">KPI Milestones</p>
            <p className="text-sm text-gray-600">Achievement alerts and progress updates</p>
          </div>
          <input
            type="checkbox"
            checked={emailEnabled}
            onChange={(e) => setEmailEnabled(e.target.checked)}
            className="rounded border-gray-300 text-gray-900 focus:ring-gray-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">System Alerts</p>
            <p className="text-sm text-gray-600">Critical system updates and maintenance</p>
          </div>
          <input
            type="checkbox"
            checked={emailEnabled}
            onChange={(e) => setEmailEnabled(e.target.checked)}
            className="rounded border-gray-300 text-gray-900 focus:ring-gray-500"
          />
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-300">
        <button className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
          <Settings className="w-4 h-4" />
          Manage Notification Preferences
        </button>
      </div>
    </div>
  );
};

export default EmailAlert;