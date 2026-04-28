import React from 'react'
import { toast as hotToast } from 'react-hot-toast'

export const ToasterProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <>{children}</>
}

export function useToast() {
  return (t: { title: string; description?: string; type?: 'success' | 'error' | 'info' }) => {
    const message = t.description ? `${t.title}: ${t.description}` : t.title;
    if (t.type === 'success') hotToast.success(message);
    else if (t.type === 'error') hotToast.error(message);
    else hotToast(message);
  }
}

export default ToasterProvider

