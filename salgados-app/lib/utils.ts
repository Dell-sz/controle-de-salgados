import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export const formatQuantity = (value: number, unit: string = 'un') => {
  return `${value} ${unit}`
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const getStatusColor = (status: string) => {
  const colors = {
    'produzindo': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    'pronto': 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    'estoque_baixo': 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
    'vendido': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  }
  return colors[status as keyof typeof colors] || 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
}

