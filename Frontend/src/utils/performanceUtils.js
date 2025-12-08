export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const calculateAverageRating = (reviews) => {
  if (reviews.length === 0) return 0;
  const total = reviews.reduce((sum, review) => sum + review.overallRating, 0);
  return (total / reviews.length).toFixed(1);
};

export const getRatingDescription = (rating) => {
  if (rating >= 4.5) return 'Outstanding';
  if (rating >= 4.0) return 'Excellent';
  if (rating >= 3.5) return 'Good';
  if (rating >= 3.0) return 'Satisfactory';
  return 'Needs Improvement';
};