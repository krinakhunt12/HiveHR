export const mockPerformanceData = {
  reviews: [
    {
      id: '1',
      employeeId: 'current-user',
      employeeName: 'Sarah Johnson',
      employeeEmail: 'sarah.j@comline.com',
      period: 'Q3 2024',
      overallRating: 4.5,
      goalsProgress: 85,
      status: 'completed',
      reviewDate: '2024-09-15',
      updatedAt: '2024-09-20',
    },
    {
      id: '2', 
      employeeId: 'current-user',
      employeeName: 'Sarah Johnson',
      employeeEmail: 'sarah.j@comline.com',
      period: 'Q2 2024',
      overallRating: 4.2,
      goalsProgress: 78,
      status: 'completed',
      reviewDate: '2024-06-10',
      updatedAt: '2024-06-15',
    },
    {
      id: '3',
      employeeId: 'emp-002',
      employeeName: 'Mike Chen',
      employeeEmail: 'mike.chen@comline.com',
      period: 'Q3 2024',
      overallRating: 4.0,
      goalsProgress: 90,
      status: 'completed',
      reviewDate: '2024-09-18',
      updatedAt: '2024-09-22',
    }
  ],
  goals: [
    {
      id: '1',
      title: 'Complete Advanced React Course',
      description: 'Finish the advanced React patterns and best practices course',
      progress: 75,
      dueDate: '2024-12-31',
      status: 'In Progress'
    },
    {
      id: '2',
      title: 'Lead Project Documentation',
      description: 'Create comprehensive documentation for the new HR system',
      progress: 100,
      dueDate: '2024-10-15', 
      status: 'Completed'
    },
    {
      id: '3',
      title: 'Improve Code Review Quality',
      description: 'Provide more detailed and constructive code reviews',
      progress: 60,
      dueDate: '2024-11-30',
      status: 'In Progress'
    }
  ]
};