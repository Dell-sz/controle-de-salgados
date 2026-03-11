'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { Calendar, TrendingUp } from 'lucide-react'

interface GraficoProducaoProps {
  producoes?: any[]
  vendas?: any[]
}

export function GraficoProducao({ producoes = [], vendas = [] }: GraficoProducaoProps) {
  const [periodo, setPeriodo] = useState('dia')

  const data = useMemo(() => {
    // Group by date for the chart
    const grouped: Record<string, { producao: number; vendas: number; meta: number }> = {}

    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      grouped[dateStr] = { producao: 0, vendas: 0, meta: 50 }
    }

    // Aggregate production data
    producoes.forEach((p: any) => {
      const date = p.data?.split('T')[0]
      if (date && grouped[date]) {
        const qtd = p.itens?.reduce((acc: number, item: any) => acc + (item.quantidade || 0), 0) || 0
        grouped[date].producao += qtd
      }
    })

    // Aggregate sales data
    vendas.forEach((v: any) => {
      const date = v.data?.split('T')[0]
      if (date && grouped[date]) {
        grouped[date].vendas += parseFloat(v.valor_total) || 0
      }
    })

    return Object.entries(grouped).map(([date, values]) => ({
      hora: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      producao: values.producao,
      vendas: values.vendas,
      meta: values.meta
    }))
  }, [producoes, vendas])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Produção vs Vendas
        </h2>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <label htmlFor="periodo-select" className="sr-only">Selecione o período</label>
          <select
            id="periodo-select"
            value={periodo}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPeriodo(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="dia">Hoje</option>
            <option value="semana">Esta Semana</option>
            <option value="mes">Este Mês</option>
          </select>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="hora"
              className="text-xs fill-muted-foreground"
              tickLine={false}
            />
            <YAxis
              className="text-xs fill-muted-foreground"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="producao"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
              activeDot={{ r: 8 }}
              name="Produção"
            />
            <Line
              type="monotone"
              dataKey="vendas"
              stroke="#22c55e"
              strokeWidth={3}
              dot={{ fill: '#22c55e', strokeWidth: 2 }}
              name="Vendas (R$)"
            />
            <Line
              type="monotone"
              dataKey="meta"
              stroke="#94a3b8"
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
              name="Meta"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

