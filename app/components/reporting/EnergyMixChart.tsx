'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import type { EnergyMix } from '../../api/reporting'

interface EnergyMixChartProps {
  energyMix: EnergyMix
  onComponentClick?: (component: string) => void
}

const COLORS = {
  machines: '#FF6384',
  lights: '#FFCE56',
  hvac: '#36A2EB',
  exhaust_fan: '#4BC0C0',
  office: '#9966FF',
  laser: '#FF9F40',
}

export default function EnergyMixChart({ energyMix, onComponentClick }: EnergyMixChartProps) {
  const data = energyMix.components.map((comp) => ({
    name: comp.name,
    value: comp.value,
    percentage: comp.percentage,
    color: comp.color || COLORS[comp.name.toLowerCase().replace(/\s+/g, '_') as keyof typeof COLORS] || '#8884d8',
  }))

  const handleClick = (data: any) => {
    if (onComponentClick) {
      onComponentClick(data.name)
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 min-h-[400px]">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        {energyMix.device_name}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-80 min-h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percentage }) => `${percentage.toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                onClick={handleClick}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string, props: any) => [
                  `${value.toFixed(2)} kWh (${props.payload.percentage.toFixed(1)}%)`,
                  name,
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col justify-center space-y-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Load (kW)</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {energyMix.load_kw.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total kWh</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {energyMix.total_kwh.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="space-y-2">
            {data.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={() => handleClick(item)}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {item.name}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}





