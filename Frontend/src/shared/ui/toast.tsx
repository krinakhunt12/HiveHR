import React, { createContext, useCallback, useContext, useState } from 'react'
import { cn } from '@/shared/utils/cn'

type ToastType = 'success' | 'error' | 'info'

type Toast = {
  id: string
  title: string
  description?: string
  type?: ToastType
}

type ToastContextValue = {
  toast: (t: Omit<Toast, 'id'> & { duration?: number }) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export const ToasterProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((t: Omit<Toast, 'id'> & { duration?: number }) => {
    const id = String(Date.now()) + Math.random().toString(36).slice(2, 8)
    const toastItem: Toast = { id, title: t.title, description: t.description, type: t.type }
    setToasts((s) => [...s, toastItem])

    const dur = t.duration ?? 5000
    setTimeout(() => {
      setToasts((s) => s.filter((x) => x.id !== id))
    }, dur)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-[100]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "max-w-md w-full p-6 rounded-[1.5rem]  border backdrop-blur-xl animate-in slide-in-from-right-10 fade-in duration-500 flex flex-col gap-1",
              t.type === 'error' ? 'bg-destructive/10 border-destructive/20 text-destructive' :
                t.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800' :
                  'bg-background/80 border-border text-foreground shadow-premium'
            )}
          >
            <div className="font-bold text-sm tracking-tight">{t.title}</div>
            {t.description && <div className="text-sm font-medium  leading-relaxed">{t.description}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx || !ctx.toast) {
    // Fallback if context is not available yet
    return (t: any) => console.log('Toast:', t);
  }
  return ctx.toast
}

export default ToasterProvider

