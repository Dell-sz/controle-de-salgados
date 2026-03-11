'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, TrendingUp, UtensilsCrossed, DollarSign, Package } from 'lucide-react'
import { KPICards } from '../componentes/dashboard/KPICards'
import { GraficoProducao } from '../componentes/dashboard/GraficoProducao'
import { EsteiraKanban } from '../componentes/dashboard/EsteiraKanban'
import { cn, formatCurrency } from '@/lib/utils'
import { api } from '@/lib/api'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>({
    produtosProntos: 0,
    faturamentoHoje: 0,
    estoqueCritico: 0,
    producaoHoje: 0,
    vendas: [],
    producoes: [],
    estoque: []
  })

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      setLoading(true)
      const [dashboard, vendas, producoes, estoque] = await Promise.all([
        api.getDashboard().catch(() => ({})),
        api.getSaidas().catch(() => []),
        api.getProducoes().catch(() => []),
        api.getProdutos().catch(() => [])
      ])

      // Calculate totals
      const hoje = new Date().toISOString().split('T')[0]
      const vendasHoje = (vendas as any[]).filter((v: any) => v.data?.startsWith(hoje))
      const faturamentoHoje = vendasHoje.reduce((acc: number, v: any) => acc + (parseFloat(v.valor_total) || 0), 0)

      setData({
        produtosProntos: (estoque as any[]).reduce((acc: number, p: any) => acc + (p.quantidade || 0), 0),
        faturamentoHoje,
        estoqueCritico: (estoque as any[]).filter((p: any) => p.quantidade <= (p.estoque_minimo || 5)).length,
        producaoHoje: (producoes as any[]).filter((p: any) => p.data?.startsWith(hoje)).length,
        vendas: vendas,
        producoes: producoes,
        estoque: estoque
      })
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const kpis = [
    {
      title: 'Salgados Prontos',
      value: data.produtosProntos,
      unit: 'un',
      icon: UtensilsCrossed,
      trend: 12,
      trendUp: true,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Faturamento Hoje',
      value: data.faturamentoHoje,
      format: 'currency',
      icon: DollarSign,
      trend: 8,
      trendUp: true,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Estoque Crítico',
      value: data.estoqueCritico,
      unit: 'itens',
      icon: Package,
      trend: 2,
      trendUp: false,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Produção Hoje',
      value: data.producaoHoje,
      unit: 'un',
      icon: TrendingUp,
      trend: 5,
      trendUp: true,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Visão geral da produção e vendas de hoje
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <KPICards kpis={kpis} loading={loading} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <GraficoProducao producoes={data.producoes} vendas={data.vendas} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass-card rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Alertas de Estoque
          </h2>

          <div className="space-y-4">
            {(data.estoque as any[]).filter((p: any) => p.quantidade <= (p.estoque_minimo || 5)).slice(0, 5).map((item: any, index: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-background/50"
              >
                <div>
                  <p className="font-medium">{item.nome}</p>
                  <p className="text-sm text-muted-foreground">{item.quantidade} un</p>
                </div>
                <div className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
                  Crítico
                </div>
              </motion.div>
            ))}
            {(data.estoque as any[]).filter((p: any) => p.quantidade <= (p.estoque_minimo || 5)).length === 0 && (
              <p className="text-muted-foreground text-sm">Nenhum alerta de estoque</p>
            )}
          </div>

          <button className="w-full mt-4 py-2 text-sm text-primary hover:text-primary/80 transition-colors">
            Ver todos os ingredientes →
          </button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-lg font-semibold mb-4">Esteira de Produção</h2>
        <EsteiraKanban />
      </motion.div>
    </div>
  )
}

