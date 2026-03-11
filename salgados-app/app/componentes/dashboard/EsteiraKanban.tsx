'use client'

import { motion } from 'framer-motion'
import { Clock, Package, CheckCircle, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'

const etapas = [
  {
    id: 'pendente',
    titulo: 'Pendente',
    icon: Clock,
    color: 'bg-yellow-500',
    items: [
      { id: 1, nome: 'Coxinha 50un', cliente: 'Lanchonete Central', hora: '14:30' },
      { id: 2, nome: 'Empada 30un', cliente: 'Supermercado ABC', hora: '15:00' },
    ]
  },
  {
    id: 'produzindo',
    titulo: 'Produzindo',
    icon: Package,
    color: 'bg-blue-500',
    items: [
      { id: 3, nome: 'Pastel 100un', cliente: 'Evento João', hora: '14:00' },
    ]
  },
  {
    id: 'pronto',
    titulo: 'Pronto',
    icon: CheckCircle,
    color: 'bg-green-500',
    items: [
      { id: 4, nome: 'Quibe 40un', cliente: 'Restaurante Sabor', hora: '13:30' },
      { id: 5, nome: 'Empada 20un', cliente: 'Mercado Junior', hora: '13:45' },
    ]
  },
  {
    id: 'entregue',
    titulo: 'Entregue',
    icon: Truck,
    color: 'bg-purple-500',
    items: [
      { id: 6, nome: 'Coxinha 80un', cliente: 'Lanchonete do João', hora: '12:00' },
    ]
  },
]

export function EsteiraKanban() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {etapas.map((etapa, etapaIndex) => {
        const Icon = etapa.icon

        return (
          <motion.div
            key={etapa.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: etapaIndex * 0.1 }}
            className="glass-card rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className={cn("p-2 rounded-lg", etapa.color, "bg-opacity-20")}>
                <Icon className={cn("w-4 h-4", etapa.color.replace('bg-', 'text-'))} />
              </div>
              <h3 className="font-semibold">{etapa.titulo}</h3>
              <span className="ml-auto bg-muted px-2 py-0.5 rounded-full text-xs">
                {etapa.items.length}
              </span>
            </div>

            <div className="space-y-3">
              {etapa.items.map((item, itemIndex) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: etapaIndex * 0.1 + itemIndex * 0.05 }}
                  className="p-3 bg-background/50 rounded-lg hover:bg-background/80 transition-colors cursor-pointer"
                >
                  <p className="font-medium text-sm">{item.nome}</p>
                  <p className="text-xs text-muted-foreground">{item.cliente}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.hora}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

