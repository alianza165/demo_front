'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import type { BreakdownData } from '../../api/energy-analytics'

interface ProcessAreaPieChartProps {
  data: BreakdownData[]
}

const COLORS = {
  denim: '#3b82f6',
  washing: '#10b981',
  finishing: '#f59e0b',
  sewing: '#ef4444',
  general: '#8b5cf6',
}

export default function ProcessAreaPieChart({ data }: ProcessAreaPieChartProps) {
  const chartData = data.map(item => ({
    name: (item.device__process_area as string)?.charAt(0).toUpperCase() + 
          (item.device__process_area as string)?.slice(1) || 'Unknown',
    value: item.total_energy,
    percentage: item.percentage || 0,
  }))

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(props: any) => {
              const { name, value, percentage } = props
              const pct = percentage > 0 ? percentage : ((value / total) * 100)
              return `${name}: ${pct.toFixed(1)}%`
            }}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => {
              const colorKey = entry.name.toLowerCase() as keyof typeof COLORS
              return (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[colorKey] || COLORS.general} 
                />
              )
            })}
          </Pie>
          <Tooltip
            formatter={(value: number) => [
              `${value.toFixed(2)} kWh (${((value / total) * 100).toFixed(1)}%)`,
              'Energy'
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
        {chartData.map((item, index) => {
          const colorKey = item.name.toLowerCase() as keyof typeof COLORS
          return (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: COLORS[colorKey] || COLORS.general }}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.value.toFixed(0)} kWh ({item.percentage > 0 ? item.percentage.toFixed(1) : ((item.value / total) * 100).toFixed(1)}%)
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
