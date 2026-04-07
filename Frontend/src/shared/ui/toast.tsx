import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

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

    const dur = t.duration ?? 4500
    setTimeout(() => {
      setToasts((s) => s.filter((x) => x.id !== id))
    }, dur)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        {toasts.map((t) => (
          <div key={t.id} className={`max-w-sm w-full p-3 rounded-lg shadow-md border flex flex-col ${t.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : t.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-white border-slate-100 text-slate-800'}`}>
            <div className="font-semibold text-sm">{t.title}</div>
            {t.description && <div className="text-xs mt-1">{t.description}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToasterProvider')
  return ctx.toast
}

export default ToasterProvider
