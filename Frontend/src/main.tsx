import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ToasterProvider } from '@/shared/ui/toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Prevents multiple re-attempts on failing calls like 401s
    }
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToasterProvider>
        <App />
      </ToasterProvider>
    </QueryClientProvider>
  </StrictMode>,
)
