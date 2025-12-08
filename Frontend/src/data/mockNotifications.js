export const mockNotifications = [
  {
    id: '1',
    type: 'leave_approved',
    message: 'Your leave request for December 20-25 has been approved',
    read: false,
    priority: 'medium',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    metadata: {
      LeaveType: 'Casual Leave',
      Duration: '6 days',
      Manager: 'Michael Chen'
    }
  },
  {
    id: '2',
    type: 'review_assigned',
    message: 'New performance review assigned for Q4 2024',
    read: false,
    priority: 'high',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    metadata: {
      Period: 'Q4 2024',
      DueDate: 'Dec 31, 2024',
      Reviewer: 'Lisa Wang'
    }
  },
  {
    id: '3',
    type: 'kpi_milestone',
    message: 'Congratulations! You achieved 95% attendance this month',
    read: true,
    priority: 'low',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    metadata: {
      Metric: 'Attendance Rate',
      Score: '95%',
      Trend: '+2% from last month'
    }
  },
  {
    id: '4',
    type: 'system_alert',
    message: 'System maintenance scheduled for Saturday, 2:00 AM - 4:00 AM',
    read: true,
    priority: 'medium',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    metadata: {
      Duration: '2 hours',
      Impact: 'Minimal downtime expected'
    }
  },
  {
    id: '5',
    type: 'leave_applied',
    message: 'Mike Chen applied for leave from Jan 10-12',
    read: true,
    priority: 'low',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // 26 hours ago
    metadata: {
      Employee: 'Mike Chen',
      LeaveType: 'Sick Leave',
      Duration: '3 days'
    }
  },
  {
    id: '6',
    type: 'document_uploaded',
    message: 'New document "Q4 Report.pdf" has been uploaded',
    read: true,
    priority: 'low',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    metadata: {
      Document: 'Q4 Report.pdf',
      Category: 'Reports',
      UploadedBy: 'Sarah Johnson'
    }
  }
];