'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { DashboardDataCard } from '../../api/reporting'

interface DataCardProps {
  card: DashboardDataCard
  onClick?: () => void
}

export default function DataCard({ card, onClick }: DataCardProps) {
  const formatValue = (value: number | null, unit?: string): string => {
    if (value === null || value === undefined) return '—'
    // For PKR, show whole numbers
    if (unit === 'PKR' && value >= 1000) {
      return (value / 1000).toFixed(1) + 'k'
    }
    if (value >= 1000 && unit !== 'PKR') {
      return (value / 1000).toFixed(2) + 'k'
    }
    // For PKR, round to whole numbers
    if (unit === 'PKR') {
      return Math.round(value).toLocaleString()
    }
    return value.toFixed(2)
  }

  const getTrendIcon = () => {
    if (!card.trend) return null
    switch (card.trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-green-500" />
      default:
        return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const getTrendColor = () => {
    if (!card.change_percentage) return 'text-gray-600'
    if (card.change_percentage > 0) return 'text-red-600'
    if (card.change_percentage < 0) return 'text-green-600'
    return 'text-gray-600'
  }

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800 ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {card.title}
      </p>
      <div className="mt-2 flex items-baseline space-x-2">
        <span className="text-3xl font-semibold text-gray-900 dark:text-white">
          {formatValue(card.value, card.unit)}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {card.unit}
        </span>
      </div>
      {card.change !== null && card.change !== undefined && (
        <div className={`mt-2 flex items-center space-x-1 text-sm ${getTrendColor()}`}>
          {getTrendIcon()}
          <span>
            {card.change > 0 ? '+' : ''}
            {card.change.toFixed(2)} {card.unit}
          </span>
          {card.change_percentage !== null && card.change_percentage !== undefined && (
            <span className="text-xs">
              ({card.change_percentage > 0 ? '+' : ''}
              {card.change_percentage.toFixed(1)}%)
            </span>
          )}
        </div>
      )}
    </div>
  )
}



