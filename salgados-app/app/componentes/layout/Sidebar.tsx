'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Package,
  CookingPot,
  DollarSign,
  Settings,
  LogOut,
  ChefHat
} from 'lucide-react'
import { cn } from '@/lib/utils'

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: Package, label: 'Estoque', href: '/dashboard/estoque' },
  { icon: CookingPot, label: 'Produção', href: '/dashboard/producao' },
  { icon: DollarSign, label: 'Financeiro', href: '/dashboard/financeiro' },
  { icon: Settings, label: 'Configurações', href: '/dashboard/configuracoes' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-20 lg:w-64 h-screen glass-card border-r flex flex-col"
    >
      <div className="p-6 flex items-center gap-3 border-b border-border">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <ChefHat className="w-6 h-6 text-primary" />
        </div>
        <span className="hidden lg:block font-bold text-xl">
          Salg<span className="text-primary">OS</span>
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                  "hover:bg-primary/10 cursor-pointer group",
                  isActive && "bg-primary text-white hover:bg-primary/90"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5",
                  isActive ? "text-white" : "text-muted-foreground group-hover:text-primary"
                )} />
                <span className={cn(
                  "hidden lg:block font-medium",
                  isActive ? "text-white" : "text-foreground"
                )}>
                  {item.label}
                </span>
              </motion.div>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            localStorage.removeItem('token')
            localStorage.removeItem('usuario')
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
            window.location.href = '/login'
          }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl w-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden lg:block font-medium">Sair</span>
        </motion.button>
      </div>
    </motion.aside>
  )
}

