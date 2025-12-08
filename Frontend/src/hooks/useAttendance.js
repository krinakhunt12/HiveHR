import { useState, useEffect } from "react";
import { generateMockAttendanceData } from "../utils/attendanceUtils";

export const useAttendance = () => {
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockData = generateMockAttendanceData();
      setTodayAttendance(mockData.today);
      setAttendanceHistory(mockData.history);
      setStats(mockData.stats);
      setIsLoading(false);
    }, 1000);
  }, []);

  const checkIn = (location) => {
    const now = new Date();
    const checkInTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    
    const expectedTime = new Date();
    expectedTime.setHours(9, 0, 0); // 9:00 AM
    const isLate = now > expectedTime;
    const lateBy = isLate ? Math.floor((now - expectedTime) / 60000) : 0;

    setTodayAttendance({
      checkInTime,
      checkInLocation: location,
      checkOutTime: null,
      checkOutLocation: null,
      totalHours: null,
      isLate,
      lateBy,
    });
  };

  const checkOut = (location) => {
    const now = new Date();
    const checkOutTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Calculate total hours (simplified)
    const totalHours = "8h 30m"; // In real app, calculate from check-in time

    setTodayAttendance((prev) => ({
      ...prev,
      checkOutTime,
      checkOutLocation: location,
      totalHours,
    }));
  };

  return {
    todayAttendance,
    attendanceHistory,
    stats,
    checkIn,
    checkOut,
    isLoading,
  };
};
