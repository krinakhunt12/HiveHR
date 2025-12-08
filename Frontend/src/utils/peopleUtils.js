export const generateInitials = (name) => {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const filterUsers = (users, filters) => {
  return users.filter(user => {
    const matchesSearch = 
      !filters.searchQuery ||
      user.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(filters.searchQuery.toLowerCase());

    const matchesDepartment = 
      filters.department === 'all' || user.department === filters.department;

    const matchesStatus = 
      filters.status === 'all' || user.status === filters.status;

    return matchesSearch && matchesDepartment && matchesStatus;
  });
};

export const sortUsers = (users, sortBy, sortOrder) => {
  return [...users].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy === 'name') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};