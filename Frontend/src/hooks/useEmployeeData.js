import { useState, useEffect } from "react";

export const useEmployeeData = () => {
  const [employeeData, setEmployeeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Simulate API call with potential error
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            // Simulate random network errors (10% chance)
            if (Math.random() < 0.1) {
              reject(new Error("Network connection failed"));
              return;
            }
            resolve();
          }, 1000);
        });

        // Enhanced mock data with more realistic structure
        setEmployeeData({
          personalInfo: {
            name: "John Anderson",
            employeeId: "EMP-2024-001",
            department: "Engineering",
            position: "Senior Software Engineer",
            email: "john.anderson@company.com",
            phone: "+1 (555) 123-4567",
            location: "San Francisco, CA",
            joinDate: "March 15, 2020",
            manager: "Sarah Johnson",
            workSchedule: "9:00 AM - 6:00 PM",
            employmentType: "Full-time"
          },
          attendance: {
            status: "checked-in",
            checkInTime: "09:15 AM",
            checkOutTime: null,
            todayHours: "8.2",
            weeklyAverage: "8.5",
            monthlyAttendance: "96%",
            lastCheckIn: "2024-11-20T09:15:00Z"
          },
          leave: {
            summary: {
              total: 20,
              used: 8,
              remaining: 12,
              pending: 2
            },
            breakdown: [
              { type: "Casual Leave", total: 12, used: 5, remaining: 7 },
              { type: "Sick Leave", total: 6, used: 2, remaining: 4 },
              { type: "Earned Leave", total: 15, used: 1, remaining: 14 }
            ],
            upcoming: [
              { type: "Casual Leave", startDate: "2024-12-20", endDate: "2024-12-25", status: "approved" }
            ]
          },
          performance: {
            score: 4.5,
            rating: "Excellent",
            lastReviewDate: "Oct 15, 2024",
            nextReviewDate: "Apr 15, 2025",
            metrics: [
              { name: "Productivity", score: 4.8 },
              { name: "Quality", score: 4.6 },
              { name: "Teamwork", score: 4.4 },
              { name: "Initiative", score: 4.7 }
            ],
            achievements: [
              "Completed Project Phoenix ahead of schedule",
              "Mentored 2 junior developers",
              "Implemented performance optimization saving 20% resources"
            ]
          },
          kpi: {
            current: 42,
            target: 40,
            trend: 5, // percentage
            status: "exceeded", // exceeded, met, below
            period: "November 2024",
            metrics: {
              tasksCompleted: 42,
              tasksAssigned: 40,
              completionRate: "105%",
              averageTime: "2.1h"
            }
          },
          kpiHistory: [
            { day: "Mon", hours: 8, target: 8, tasks: 8, efficiency: "100%" },
            { day: "Tue", hours: 9, target: 8, tasks: 9, efficiency: "112%" },
            { day: "Wed", hours: 7.5, target: 8, tasks: 7, efficiency: "94%" },
            { day: "Thu", hours: 8.5, target: 8, tasks: 9, efficiency: "106%" },
            { day: "Fri", hours: 9, target: 8, tasks: 10, efficiency: "125%" },
            { day: "Sat", hours: 0, target: 0, tasks: 0, efficiency: "0%" },
            { day: "Sun", hours: 0, target: 0, tasks: 0, efficiency: "0%" },
          ],
          holidays: [
            {
              name: "Thanksgiving Day",
              date: "Nov 28, 2024",
              type: "Federal",
              daysUntil: 8,
              isUpcoming: true
            },
            {
              name: "Christmas Day",
              date: "Dec 25, 2024",
              type: "Federal",
              daysUntil: 35,
              isUpcoming: true
            },
            {
              name: "New Year's Day",
              date: "Jan 1, 2025",
              type: "Federal",
              daysUntil: 42,
              isUpcoming: true
            },
          ],
          files: [
            {
              id: 1,
              name: "Payslip_October_2024.pdf",
              size: "245 KB",
              date: "Oct 31, 2024",
              type: "payslip",
              category: "Finance"
            },
            {
              id: 2,
              name: "Resume_Updated.pdf",
              size: "1.2 MB",
              date: "Sep 15, 2024",
              type: "resume",
              category: "Personal"
            },
            {
              id: 3,
              name: "Tax_Form_W2.pdf",
              size: "180 KB",
              date: "Jan 20, 2024",
              type: "tax",
              category: "Finance"
            },
            {
              id: 4,
              name: "Performance_Review_Q3_2024.pdf",
              size: "320 KB",
              date: "Oct 15, 2024",
              type: "performance",
              category: "HR"
            },
          ],
          team: [
            { name: "Sarah Johnson", role: "Engineering Manager", status: "online" },
            { name: "Michael Chen", role: "Backend Engineer", status: "away" },
            { name: "Emma Wilson", role: "UI Designer", status: "offline" },
            { name: "David Miller", role: "QA Engineer", status: "online" }
          ],
          notifications: {
            unread: 3,
            items: [
              {
                id: 1,
                type: "leave",
                message: "Your leave request for Dec 20-25 has been approved",
                date: "2 hours ago",
                read: false
              },
              {
                id: 2,
                type: "performance",
                message: "New performance review assigned",
                date: "1 day ago",
                read: false
              },
              {
                id: 3,
                type: "system",
                message: "System maintenance scheduled for Saturday",
                date: "2 days ago",
                read: true
              }
            ]
          }
        });

      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch employee data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployeeData();
  }, []);

  // Function to refresh data
  const refetch = async () => {
    setIsLoading(true);
    setError(null);

    // Simulate API call
    setTimeout(() => {
      setEmployeeData(prevData => ({
        ...prevData,
        attendance: {
          ...prevData.attendance,
          status: "checked-in",
          checkInTime: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
        }
      }));
      setIsLoading(false);
    }, 500);
  };

  // Function to simulate check-in/check-out
  const toggleAttendance = () => {
    if (!employeeData) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    setEmployeeData(prev => ({
      ...prev,
      attendance: {
        ...prev.attendance,
        status: prev.attendance.status === "checked-in" ? "checked-out" : "checked-in",
        [prev.attendance.status === "checked-in" ? "checkOutTime" : "checkInTime"]: timeString,
        lastUpdated: now.toISOString()
      }
    }));
  };

  // Function to add a new file
  const addFile = (file) => {
    setEmployeeData(prev => ({
      ...prev,
      files: [file, ...prev.files]
    }));
  };

  // Function to mark notification as read
  const markNotificationAsRead = (notificationId) => {
    setEmployeeData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        items: prev.notifications.items.map(item =>
          item.id === notificationId ? { ...item, read: true } : item
        ),
        unread: prev.notifications.unread - 1
      }
    }));
  };

  return {
    employeeData,
    isLoading,
    error,
    refetch,
    toggleAttendance,
    addFile,
    markNotificationAsRead
  };
};