'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency, cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface KPI {
  title: string
  value: number
  unit?: string
  format?: string
  icon: LucideIcon
  trend: number
  trendUp: boolean
  color: string
  bgColor: string
}

interface KPICardsProps {
  kpis: KPI[]
  loading?: boolean
}

export function KPICards({ kpis, loading = false }: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon

        return (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: loading ? 0.5 : 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="glass-card rounded-xl p-6 relative overflow-hidden group"
          >
            <div className={cn(
              "absolute right-0 bottom-0 w-24 h-24 opacity-10 group-hover:scale-110 transition-transform",
              kpi.bgColor
            )}>
              <Icon className="w-full h-full" />
            </div>

            <div className="relative">
              <div className="flex items-center justify-between">
                <div className={cn("p-3 rounded-lg", kpi.bgColor)}>
                  <Icon className={cn("w-6 h-6", kpi.color)} />
                </div>

                <div className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  kpi.trendUp ? "text-green-500" : "text-red-500"
                )}>
                  {kpi.trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{kpi.trend}%</span>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-sm text-muted-foreground">{kpi.title}</h3>
                <p className="text-2xl font-bold mt-1">
                  {kpi.format === 'currency'
                    ? formatCurrency(kpi.value)
                    : `${kpi.value} ${kpi.unit || ''}`}
                </p>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

