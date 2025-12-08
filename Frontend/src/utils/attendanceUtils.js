export const generateMockAttendanceData = () => {
  const today = new Date();
  const history = [];

  // Generate 30 days of history
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const isPresent = Math.random() > 0.1; // 90% attendance
    const isLate = isPresent && Math.random() > 0.8; // 20% late when present

    if (isPresent) {
      const checkInHour = isLate ? 9 + Math.floor(Math.random() * 2) : 9;
      const checkInMinute = Math.floor(Math.random() * 60);
      const checkOutHour = 17 + Math.floor(Math.random() * 2);
      const checkOutMinute = Math.floor(Math.random() * 60);

      const totalMinutes = (checkOutHour - checkInHour) * 60 + (checkOutMinute - checkInMinute);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      history.push({
        date: date.toISOString().split("T")[0],
        checkInTime: `${checkInHour.toString().padStart(2, "0")}:${checkInMinute.toString().padStart(2, "0")} AM`,
        checkOutTime: `${(checkOutHour % 12 || 12).toString().padStart(2, "0")}:${checkOutMinute.toString().padStart(2, "0")} PM`,
        totalHours: `${hours}h ${minutes}m`,
        status: isLate ? "late" : "present",
        isLate,
        lateBy: isLate ? Math.floor(Math.random() * 60) + 10 : 0,
      });
    } else {
      history.push({
        date: date.toISOString().split("T")[0],
        checkInTime: null,
        checkOutTime: null,
        totalHours: null,
        status: "absent",
        isLate: false,
        lateBy: 0,
      });
    }
  }

  // Calculate stats
  const presentDays = history.filter((r) => r.status === "present" || r.status === "late").length;
  const lateDays = history.filter((r) => r.status === "late").length;
  const totalDays = history.length;
  
  const totalHoursWorked = history
    .filter((r) => r.totalHours)
    .reduce((sum, r) => {
      const [hours, minutes] = r.totalHours.split(" ");
      return sum + parseInt(hours) + parseInt(minutes.replace("m", "")) / 60;
    }, 0);

  const avgHours = (totalHoursWorked / presentDays).toFixed(1);
  const attendanceRate = ((presentDays / totalDays) * 100).toFixed(1);

  return {
    today: null, // Will be set by check-in
    history,
    stats: {
      presentDays,
      lateDays,
      totalDays,
      avgHours,
      attendanceRate,
    },
  };
};

export const calculateWorkHours = (checkIn, checkOut) => {
  const checkInDate = new Date(`1970-01-01T${checkIn}`);
  const checkOutDate = new Date(`1970-01-01T${checkOut}`);
  const diff = checkOutDate - checkInDate;
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
};