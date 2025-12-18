'use client'

import { Zap, TrendingUp, DollarSign, Activity } from 'lucide-react'
import type { DashboardStats } from '../../api/energy-analytics'

interface StatsCardsProps {
  stats: DashboardStats
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`
    return num.toFixed(2)
  }

  const cards = [
    {
      title: 'Total Energy',
      value: `${formatNumber(stats.total_energy_kwh)} kWh`,
      subtitle: `${stats.day_count} days of data`,
      icon: Zap,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
    },
    {
      title: 'Consumers Energy',
      value: `${formatNumber(stats.consumers_energy_kwh || 0)} kWh`,
      subtitle: `${stats.consumers_count || 0} consumer devices`,
      icon: TrendingUp,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
    {
      title: 'Main Feeders',
      value: `${formatNumber(stats.main_feeders_energy_kwh || 0)} kWh`,
      subtitle: `${stats.main_feeders_count || 0} incoming feeders`,
      icon: Activity,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
    },
    {
      title: 'Peak Daily',
      value: `${formatNumber(stats.peak_daily_energy_kwh)} kWh`,
      subtitle: 'Highest single day',
      icon: Activity,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <div
            key={index}
            className={`${card.bgColor} ${card.borderColor} border rounded-lg p-6 shadow-sm transition-transform hover:scale-105`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {card.title}
              </h3>
              <Icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {card.value}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {card.subtitle}
            </p>
          </div>
        )
      })}
    </div>
  )
}
