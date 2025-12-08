export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const calculateLeaveDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

export const isLeaveOverlapping = (leaves, newStartDate, newEndDate) => {
  const newStart = new Date(newStartDate);
  const newEnd = new Date(newEndDate);

  return leaves.some(leave => {
    if (leave.status !== 'approved') return false;
    
    const existingStart = new Date(leave.startDate);
    const existingEnd = new Date(leave.endDate);
    
    return (newStart <= existingEnd && newEnd >= existingStart);
  });
};