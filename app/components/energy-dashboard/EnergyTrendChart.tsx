'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'
import type { TrendData } from '../../api/energy-analytics'

interface EnergyTrendChartProps {
  data: TrendData[]
  groupBy: 'day' | 'week' | 'month'
}

export default function EnergyTrendChart({ data, groupBy }: EnergyTrendChartProps) {
  // Format period for display
  const formatPeriod = (period: string) => {
    if (!period) return ''
    const date = new Date(period)
    if (groupBy === 'month') {
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    } else if (groupBy === 'week') {
      return `Week ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const chartData = data.map(item => ({
    period: formatPeriod(item.period),
    energy: Math.round(item.total_energy * 100) / 100,
    avgPower: Math.round(item.avg_power * 100) / 100,
  }))

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
        <XAxis
          dataKey="period"
          className="text-gray-700 dark:text-gray-300"
          tick={{ fill: 'currentColor', fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis
          className="text-gray-700 dark:text-gray-300"
          tick={{ fill: 'currentColor' }}
          label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
          formatter={(value: number) => [`${value.toFixed(2)} kWh`, 'Energy']}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="energy"
          stroke="#3b82f6"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorEnergy)"
          name="Total Energy (kWh)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
