'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import type { TrendData } from '../../api/energy-analytics'

interface DailyEnergyChartProps {
  data: TrendData[]
}

export default function DailyEnergyChart({ data }: DailyEnergyChartProps) {
  const formatDate = (period: string) => {
    if (!period) return ''
    const date = new Date(period)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const chartData = data.map(item => ({
    date: formatDate(item.period),
    energy: Math.round(item.total_energy * 100) / 100,
    avgPower: Math.round(item.avg_power * 100) / 100,
  }))

  // Calculate average for reference line
  const avgEnergy = chartData.reduce((sum, item) => sum + item.energy, 0) / chartData.length

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
        <XAxis
          dataKey="date"
          className="text-gray-700 dark:text-gray-300"
          tick={{ fill: 'currentColor', fontSize: 11 }}
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
          }}
          formatter={(value: number) => [`${value.toFixed(2)} kWh`, 'Energy']}
        />
        <Legend />
        <ReferenceLine
          y={avgEnergy}
          stroke="#f59e0b"
          strokeDasharray="5 5"
          label={{ value: `Avg: ${avgEnergy.toFixed(2)} kWh`, position: 'right' }}
        />
        <Line
          type="monotone"
          dataKey="energy"
          stroke="#3b82f6"
          strokeWidth={3}
          dot={{ fill: '#3b82f6', r: 4 }}
          activeDot={{ r: 6 }}
          name="Daily Energy (kWh)"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
