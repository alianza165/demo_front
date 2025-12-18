'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import type { DeviceBreakdown } from '../../api/energy-analytics'

interface MainFeedersChartProps {
  data: DeviceBreakdown[]
}

const getColorForFeeder = (index: number) => {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
  return colors[index % colors.length]
}

export default function MainFeedersChart({ data }: MainFeedersChartProps) {
  const chartData = data.map((item, index) => ({
    name: item.device__name.length > 15 
      ? item.device__name.substring(0, 15) + '...' 
      : item.device__name,
    fullName: item.device__name,
    energy: Math.round(item.total_energy * 100) / 100,
    avgDaily: Math.round(item.avg_daily * 100) / 100,
    peakDaily: Math.round(item.peak_daily * 100) / 100,
    color: getColorForFeeder(index),
    processArea: item.device__process_area,
    floor: item.device__floor,
  }))

  if (chartData.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No main feeder data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
        <XAxis
          dataKey="name"
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
          formatter={(value: number, name: string, props: any) => {
            if (name === 'energy') {
              return [
                `${value.toFixed(2)} kWh\nAvg: ${props.payload.avgDaily.toFixed(2)} kWh/day\nPeak: ${props.payload.peakDaily.toFixed(2)} kWh`,
                'Total Energy'
              ]
            }
            return [value, name]
          }}
          labelFormatter={(label) => chartData.find(d => d.name === label)?.fullName || label}
        />
        <Legend />
        <Bar dataKey="energy" name="Total Energy (kWh)" radius={[8, 8, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
