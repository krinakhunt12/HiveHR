import { toast as hotToast } from 'react-hot-toast';

/**
 * --- USE TOAST REDIRECT ---
 * This file acts as a bridge to react-hot-toast.
 */
export const useToast = () => {
  const toast = (t: { title: string; description?: string; type?: 'success' | 'error' | 'info' }) => {
    const message = t.description ? `${t.title}: ${t.description}` : t.title;
    
    if (t.type === 'success') {
      hotToast.success(message);
    } else if (t.type === 'error') {
      hotToast.error(message);
    } else {
      hotToast(message);
    }
  };

  return { toast };
};

export default useToast;
