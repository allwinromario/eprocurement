'use client'

import { SessionProvider } from 'next-auth/react'
import { GlobalLoadingProvider } from './GlobalLoader'
import { Toaster } from 'react-hot-toast'

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <GlobalLoadingProvider>
        <Toaster position="top-center" />
        {children}
      </GlobalLoadingProvider>
    </SessionProvider>
  )
} 