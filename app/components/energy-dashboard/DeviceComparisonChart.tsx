'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import type { DeviceBreakdown } from '../../api/energy-analytics'

interface DeviceComparisonChartProps {
  data: DeviceBreakdown[]
}

const getColorForDevice = (index: number, total: number) => {
  const hue = (index * 360) / total
  return `hsl(${hue}, 70%, 50%)`
}

export default function DeviceComparisonChart({ data }: DeviceComparisonChartProps) {
  const chartData = data.map((item, index) => ({
    name: item.device__name.length > 20 
      ? item.device__name.substring(0, 20) + '...' 
      : item.device__name,
    fullName: item.device__name,
    energy: Math.round(item.total_energy * 100) / 100,
    avgDaily: Math.round(item.avg_daily * 100) / 100,
    peakDaily: Math.round(item.peak_daily * 100) / 100,
    color: getColorForDevice(index, data.length),
    processArea: item.device__process_area,
    floor: item.device__floor,
  }))

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 20, right: 30, left: 150, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
        <XAxis
          type="number"
          className="text-gray-700 dark:text-gray-300"
          tick={{ fill: 'currentColor' }}
          label={{ value: 'Energy (kWh)', position: 'insideBottom', offset: -5 }}
        />
        <YAxis
          type="category"
          dataKey="name"
          className="text-gray-700 dark:text-gray-300"
          tick={{ fill: 'currentColor', fontSize: 11 }}
          width={140}
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
        <Bar dataKey="energy" name="Total Energy (kWh)" radius={[0, 8, 8, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
