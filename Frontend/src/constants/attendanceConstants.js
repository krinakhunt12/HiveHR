export const ATTENDANCE_STATUS = {
  PRESENT: "present",
  LATE: "late",
  ABSENT: "absent",
  ON_LEAVE: "on-leave",
  HALF_DAY: "half-day",
};

export const WORK_SCHEDULE = {
  START_TIME: "09:00",
  END_TIME: "17:00",
  LATE_THRESHOLD_MINUTES: 15,
  MINIMUM_HOURS: 8,
};

export const STATUS_COLORS = {
  present: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
  late: { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" },
  absent: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
  "on-leave": { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  "half-day": { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500" },
};

