'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area } from 'recharts'
import type { MonthlyTrendData } from '../../api/reporting'

interface TrendChartProps {
  title: string
  data: MonthlyTrendData[]
  yAxisLabel?: string
  onClick?: (month: string) => void
}

const ZONE_COLORS = {
  green: '#10B981',
  yellow: '#F59E0B',
  red: '#EF4444',
}

export default function TrendChart({ title, data, yAxisLabel = 'kWh', onClick }: TrendChartProps) {
  // Prepare data with zones for background
  const chartData = data.map((point) => ({
    ...point,
    greenZone: point.zone === 'green' ? point.value : null,
    yellowZone: point.zone === 'yellow' ? point.value : null,
    redZone: point.zone === 'red' ? point.value : null,
  }))

  const handleClick = (data: any) => {
    if (onClick && data?.activePayload?.[0]?.payload?.month) {
      onClick(data.activePayload[0].payload.month)
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            onClick={handleClick}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
            <XAxis
              dataKey="month"
              className="text-xs text-gray-600 dark:text-gray-400"
            />
            <YAxis
              label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
              className="text-xs text-gray-600 dark:text-gray-400"
            />
            <Tooltip
              formatter={(value: number, name: string, props: any) => {
                if (name === 'value') {
                  return [
                    `${value.toFixed(2)} ${yAxisLabel} (${props.payload.zone} zone)`,
                    'Value',
                  ]
                }
                return [value, name]
              }}
              labelStyle={{ color: '#000' }}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#2563EB"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            {data.some((d) => d.target !== null && d.target !== undefined) && (
              <ReferenceLine
                y={data[0]?.target}
                label="Target"
                stroke="#F59E0B"
                strokeDasharray="5 5"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span className="text-gray-600 dark:text-gray-400">Good</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-yellow-500" />
          <span className="text-gray-600 dark:text-gray-400">Warning</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span className="text-gray-600 dark:text-gray-400">Critical</span>
        </div>
      </div>
    </div>
  )
}





