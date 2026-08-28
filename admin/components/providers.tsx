'use client'

import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import { TrpcProvider } from '@/lib/trpc/provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TrpcProvider>
      <ThemeProvider attribute='class' defaultTheme='light' enableSystem disableTransitionOnChange>
        {children}
        <Toaster richColors closeButton />
      </ThemeProvider>
    </TrpcProvider>
  )
}
