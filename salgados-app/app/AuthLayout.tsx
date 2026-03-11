'use client'

import { usePathname } from 'next/navigation'
import { ThemeProvider } from './componentes/layout/ThemeProvider'
import { Sidebar } from './componentes/layout/Sidebar'
import { Topbar } from './componentes/layout/Topbar'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  return (
    <ThemeProvider>
      {isLoginPage ? (
        children
      ) : (
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Topbar />
            <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-orange-50/50 to-transparent dark:from-orange-950/20">
              {children}
            </main>
          </div>
        </div>
      )}
    </ThemeProvider>
  )
}

