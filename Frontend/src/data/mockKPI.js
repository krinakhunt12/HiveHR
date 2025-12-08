export const mockKPIData = {
  overview: {
    overallProductivity: 87.5,
    productivityChange: 2.3,
    teamEngagement: 92.1,
    engagementChange: 1.2,
    goalAchievement: 78.9,
    goalChange: 4.5
  },
  attendanceRate: 96.2,
  attendanceChange: 1.1,
  avgWorkingHours: 8.4,
  hoursChange: -0.5,
  taskCompletion: 88.7,
  taskChange: 3.2,
  leaveRate: 4.8,
  leaveChange: -1.2,

  // Line chart data - Hours worked over time
  hoursTrend: [
    { name: 'Jan', value: 8.2 },
    { name: 'Feb', value: 8.1 },
    { name: 'Mar', value: 8.3 },
    { name: 'Apr', value: 8.5 },
    { name: 'May', value: 8.4 },
    { name: 'Jun', value: 8.6 },
    { name: 'Jul', value: 8.3 },
    { name: 'Aug', value: 8.4 },
    { name: 'Sep', value: 8.7 },
    { name: 'Oct', value: 8.5 },
    { name: 'Nov', value: 8.6 },
    { name: 'Dec', value: 8.4 }
  ],

  // Bar chart data - Leaves by department
  leavesByDepartment: [
    { name: 'Engineering', casual: 45, sick: 23, other: 12 },
    { name: 'Product', casual: 32, sick: 18, other: 8 },
    { name: 'Design', casual: 28, sick: 15, other: 6 },
    { name: 'Marketing', casual: 38, sick: 22, other: 10 },
    { name: 'Sales', casual: 41, sick: 25, other: 14 },
    { name: 'HR', casual: 19, sick: 12, other: 5 }
  ],

  // Pie chart data - Performance distribution
  performanceDistribution: [
    { name: 'Outstanding', value: 15 },
    { name: 'Excellent', value: 25 },
    { name: 'Good', value: 40 },
    { name: 'Satisfactory', value: 15 },
    { name: 'Needs Improvement', value: 5 }
  ],

  // Department comparison
  departmentComparison: [
    { name: 'Engineering', attendance: 97, productivity: 92 },
    { name: 'Product', attendance: 95, productivity: 88 },
    { name: 'Design', attendance: 96, productivity: 90 },
    { name: 'Marketing', attendance: 94, productivity: 85 },
    { name: 'Sales', attendance: 93, productivity: 87 },
    { name: 'HR', attendance: 98, productivity: 91 }
  ]
};