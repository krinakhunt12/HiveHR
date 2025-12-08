import { useState, useEffect } from 'react';
import { mockPerformanceData } from '../data/mockPerformance';

export const usePerformance = () => {
  const [reviews, setReviews] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setReviews(mockPerformanceData.reviews);
        setGoals(mockPerformanceData.goals);
      } catch (error) {
        console.error('Failed to fetch performance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const addReview = async (reviewData) => {
    const newReview = {
      id: Date.now().toString(),
      ...reviewData,
      status: 'completed',
      reviewDate: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setReviews(prev => [newReview, ...prev]);
    return newReview;
  };

  return {
    reviews,
    goals,
    loading,
    addReview,
  };
};