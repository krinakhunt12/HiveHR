// Utility functions for theme management
export const getSystemTheme = () => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const setTheme = (theme) => {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  
  localStorage.setItem('theme', theme);
};

export const getStoredTheme = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('theme');
};

// CSS variable getters for consistent theming
export const getColor = (color, shade = 500) => {
  const colors = {
    primary: `var(--color-primary-${shade})`,
    gray: `var(--color-gray-${shade})`,
    blue: `var(--color-blue-${shade})`,
    red: `var(--color-red-${shade})`,
    green: `var(--color-green-${shade})`,
    yellow: `var(--color-yellow-${shade})`,
  };
  
  return colors[color] || color;
};