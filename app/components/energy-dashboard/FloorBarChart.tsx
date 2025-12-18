'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import type { BreakdownData } from '../../api/energy-analytics'

interface FloorBarChartProps {
  data: BreakdownData[]
}

const FLOOR_COLORS: Record<string, string> = {
  'GF': '#3b82f6',
  'FF': '#10b981',
  'SF': '#f59e0b',
  'WF': '#ef4444',
  'none': '#8b5cf6',
}

export default function FloorBarChart({ data }: FloorBarChartProps) {
  const chartData = data.map(item => ({
    floor: item.device__floor || 'Unknown',
    energy: Math.round(item.total_energy * 100) / 100,
    avgDaily: Math.round(item.avg_daily * 100) / 100,
    deviceCount: item.device_count,
  }))

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
        <XAxis
          dataKey="floor"
          className="text-gray-700 dark:text-gray-300"
          tick={{ fill: 'currentColor' }}
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
          }}
          formatter={(value: number, name: string) => {
            if (name === 'energy') return [`${value.toFixed(2)} kWh`, 'Total Energy']
            if (name === 'avgDaily') return [`${value.toFixed(2)} kWh`, 'Avg Daily']
            return [value, name]
          }}
        />
        <Legend />
        <Bar dataKey="energy" name="Total Energy (kWh)" radius={[8, 8, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={FLOOR_COLORS[entry.floor] || FLOOR_COLORS.none}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
