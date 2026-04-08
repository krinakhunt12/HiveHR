/**
 * --- USE TOAST REDIRECT ---
 * This file acts as a bridge to your existing Toast provider.
 */
import { useToast as useToastHook } from '../toast';

export const useToast = () => {
  const toast = useToastHook();
  return { toast };
};

export default useToast;
