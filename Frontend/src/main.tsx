import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ToasterProvider } from '@/shared/ui/toast'
import { Toaster } from 'react-hot-toast'
import { QueryProvider } from '@/shared/components/QueryProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToasterProvider>
      <Toaster position="top-right" />
      <QueryProvider>
        <App />
      </QueryProvider>
    </ToasterProvider>
  </StrictMode>,
)

