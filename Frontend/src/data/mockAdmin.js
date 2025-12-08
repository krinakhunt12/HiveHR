export const mockAdminData = {
  stats: {
    totalEmployees: 156,
    employeeChange: 2.5,
    totalDepartments: 8,
    departmentChange: 0,
    activeRoles: 24,
    roleChange: 1.2,
    avgAttendance: 95.2,
    attendanceChange: 0.8,
    pendingLeaves: 12,
    leaveChange: -3.2,
    monthlyReports: 45,
    reportChange: 5.7
  },
  systemHealth: {
    apiStatus: 'healthy',
    apiUptime: '99.9%',
    redisStatus: 'healthy',
    redisUptime: '100%',
    databaseStatus: 'healthy',
    databaseUptime: '99.8%',
    overallStatus: 'healthy',
    lastUpdated: '2 minutes ago'
  },
  users: [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.j@comline.com',
      role: 'Senior Software Engineer',
      department: 'Engineering',
      status: 'active',
      joinDate: '2022-03-15'
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@comline.com',
      role: 'Engineering Manager',
      department: 'Engineering',
      status: 'active',
      joinDate: '2020-01-10'
    },
    {
      id: '3',
      name: 'Emily Davis',
      email: 'emily.davis@comline.com',
      role: 'Product Manager',
      department: 'Product',
      status: 'active',
      joinDate: '2021-06-20'
    },
    {
      id: '4',
      name: 'David Wilson',
      email: 'david.wilson@comline.com',
      role: 'UI/UX Designer',
      department: 'Design',
      status: 'inactive',
      joinDate: '2023-08-05'
    },
    {
      id: '5',
      name: 'Lisa Wang',
      email: 'lisa.wang@comline.com',
      role: 'Director of Engineering',
      department: 'Engineering',
      status: 'active',
      joinDate: '2019-11-12'
    }
  ],
  leavePolicies: [
    {
      id: '1',
      name: 'Casual Leave',
      maxDays: 12,
      carryOver: 3,
      minNotice: 1,
      description: 'For personal and casual purposes',
      employeeCount: 156,
      utilization: 65
    },
    {
      id: '2',
      name: 'Sick Leave',
      maxDays: 6,
      carryOver: 0,
      minNotice: 0,
      description: 'For medical and health reasons',
      employeeCount: 156,
      utilization: 28
    },
    {
      id: '3',
      name: 'Earned Leave',
      maxDays: 15,
      carryOver: 5,
      minNotice: 7,
      description: 'Accumulated earned time off',
      employeeCount: 156,
      utilization: 42
    },
    {
      id: '4',
      name: 'Maternity Leave',
      maxDays: 84,
      carryOver: 0,
      minNotice: 30,
      description: 'For expecting mothers',
      employeeCount: 45,
      utilization: 12
    },
    {
      id: '5',
      name: 'Paternity Leave',
      maxDays: 14,
      carryOver: 0,
      minNotice: 14,
      description: 'For new fathers',
      employeeCount: 85,
      utilization: 8
    }
  ],
  departmentKPIs: [
    {
      name: 'Engineering',
      employeeCount: 45,
      attendance: 96.5,
      productivity: 92.3,
      taskCompletion: 94.7,
      leaveRate: 3.2,
      trend: 2.1
    },
    {
      name: 'Product',
      employeeCount: 12,
      attendance: 95.8,
      productivity: 88.9,
      taskCompletion: 91.2,
      leaveRate: 4.1,
      trend: 1.3
    },
    {
      name: 'Design',
      employeeCount: 8,
      attendance: 97.2,
      productivity: 90.5,
      taskCompletion: 93.8,
      leaveRate: 2.7,
      trend: 0.8
    },
    {
      name: 'Marketing',
      employeeCount: 15,
      attendance: 94.3,
      productivity: 85.7,
      taskCompletion: 89.4,
      leaveRate: 5.6,
      trend: -1.2
    },
    {
      name: 'Sales',
      employeeCount: 22,
      attendance: 93.8,
      productivity: 87.2,
      taskCompletion: 90.1,
      leaveRate: 6.2,
      trend: -0.5
    },
    {
      name: 'HR',
      employeeCount: 6,
      attendance: 98.1,
      productivity: 91.8,
      taskCompletion: 95.3,
      leaveRate: 1.9,
      trend: 3.2
    },
    {
      name: 'Finance',
      employeeCount: 8,
      attendance: 96.7,
      productivity: 89.4,
      taskCompletion: 92.6,
      leaveRate: 3.3,
      trend: 1.7
    },
    {
      name: 'Operations',
      employeeCount: 40,
      attendance: 95.1,
      productivity: 86.8,
      taskCompletion: 88.9,
      leaveRate: 4.9,
      trend: -2.1
    }
  ]
};