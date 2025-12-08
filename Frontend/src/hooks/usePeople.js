import { useState, useEffect } from 'react';
import { mockUsers, mockDepartments } from '../data/mockPeople';

export const usePeople = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUsers(mockUsers);
        
        // Calculate department counts
        const departmentCounts = mockUsers.reduce((acc, user) => {
          acc[user.department] = (acc[user.department] || 0) + 1;
          return acc;
        }, {});

        const departmentsWithCounts = mockDepartments.map(dept => ({
          ...dept,
          employeeCount: departmentCounts[dept.name] || 0
        }));

        setDepartments(departmentsWithCounts);
      } catch (err) {
        setError('Failed to load people data');
        console.error('People data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    users,
    departments,
    loading,
    error
  };
};