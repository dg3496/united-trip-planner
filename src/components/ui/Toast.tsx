// Re-exports sonner's Toaster with United styling applied.
// Usage: import { toast } from 'sonner' and call toast.success('...') anywhere.
// Place <AppToaster /> once in App.tsx.

import { Toaster } from 'sonner'

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: '#003087',
          color: 'white',
          borderRadius: '12px',
          fontSize: '14px',
        },
      }}
    />
  )
}
