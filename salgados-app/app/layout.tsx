import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import AuthLayout from './AuthLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SalgOS - Sistema de Gestão de Salgados',
  description: 'Gerencie sua produção de salgados com estilo',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthLayout>
          {children}
        </AuthLayout>
      </body>
    </html>
  )
}

