'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'

interface EfficiencyDataPoint {
  month: string
  achieved: number
  target?: number
  zone: 'green' | 'yellow' | 'red'
}

interface EfficiencyTrendChartProps {
  title: string
  data: EfficiencyDataPoint[]
  yAxisDomain?: [number, number] | ['auto', 'auto']
  targetLabel?: string
}

const zoneColors = {
  green: '#10b981',
  yellow: '#f59e0b',
  red: '#ef4444',
}

export default function EfficiencyTrendChart({
  title,
  data,
  yAxisDomain,
  targetLabel = 'Target',
}: EfficiencyTrendChartProps) {
  // Prepare data with zones for background coloring
  const chartData = data.map((point) => ({
    ...point,
    name: point.month,
  }))

  // Determine zone thresholds for background
  const hasTarget = data.some((d) => d.target !== null && d.target !== undefined)
  const targetValue = data.find((d) => d.target)?.target || 0

  // Calculate zone ranges (approximate - could be more sophisticated)
  let greenMax = targetValue * 1.05
  let yellowMax = targetValue * 1.15

  // Calculate dynamic y-axis domain based on actual data if not provided
  let calculatedDomain: [number, number] | undefined = undefined
  if (!yAxisDomain || yAxisDomain[0] === 'auto' || yAxisDomain[1] === 'auto') {
    const allValues = [
      ...data.map((d) => d.achieved),
      ...(hasTarget ? [targetValue] : []),
    ].filter((v) => v !== null && v !== undefined && !isNaN(v)) as number[]
    
    if (allValues.length > 0) {
      const minValue = Math.min(...allValues)
      const maxValue = Math.max(...allValues)
      const range = maxValue - minValue
      // Add 20% padding above and below, with minimum of 10% of max value
      const padding = Math.max(range * 0.2, maxValue * 0.1)
      calculatedDomain = [
        Math.max(0, minValue - padding),
        maxValue + padding,
      ]
    }
  }
  
  // Use provided domain or calculated domain
  const finalDomain = yAxisDomain && yAxisDomain[0] !== 'auto' && yAxisDomain[1] !== 'auto' 
    ? yAxisDomain 
    : calculatedDomain || [0, 100]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="greenZone" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.1} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="yellowZone" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.1} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="redZone" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.1} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
          <XAxis
            dataKey="name"
            className="text-gray-700 dark:text-gray-300"
            tick={{ fill: 'currentColor' }}
          />
          <YAxis
            domain={finalDomain}
            className="text-gray-700 dark:text-gray-300"
            tick={{ fill: 'currentColor' }}
            label={{ value: 'kWh/Garment', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          <Legend />
          {hasTarget && (
            <ReferenceLine
              y={targetValue}
              stroke="#3b82f6"
              strokeDasharray="5 5"
              label={{ value: targetLabel, position: 'right' }}
            />
          )}
          <Line
            type="monotone"
            dataKey="achieved"
            stroke="#f97316"
            strokeWidth={2}
            dot={{ fill: '#f97316', r: 4 }}
            name="Achieved"
          />
          {hasTarget && (
            <Line
              type="monotone"
              dataKey="target"
              stroke="#3b82f6"
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
              name={targetLabel}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}



