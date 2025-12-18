'use client'

import { useMemo } from 'react'
import type { HeatmapData } from '../../api/energy-analytics'

interface EnergyHeatmapProps {
  data: HeatmapData
}

export default function EnergyHeatmap({ data }: EnergyHeatmapProps) {
  // Calculate min and max for color scaling
  const { minEnergy, maxEnergy } = useMemo(() => {
    let min = Infinity
    let max = -Infinity
    
    data.devices.forEach(device => {
      Object.values(device.data).forEach(energy => {
        if (energy > 0) {
          min = Math.min(min, energy)
          max = Math.max(max, energy)
        }
      })
    })
    
    return { minEnergy: min === Infinity ? 0 : min, maxEnergy: max === -Infinity ? 0 : max }
  }, [data])

  // Get color intensity based on energy value
  const getColor = (energy: number): string => {
    if (energy === 0 || !energy) return '#f3f4f6' // gray-100
    
    const ratio = (energy - minEnergy) / (maxEnergy - minEnergy || 1)
    const intensity = Math.min(1, Math.max(0, ratio))
    
    // Green to yellow to red gradient using HSL
    if (intensity < 0.33) {
      // Green: 120deg, saturation 70%, lightness decreases as intensity increases
      const lightness = 90 - (intensity / 0.33) * 30
      return `hsl(120, 70%, ${lightness}%)`
    } else if (intensity < 0.66) {
      // Yellow: 60deg
      const lightness = 85 - ((intensity - 0.33) / 0.33) * 25
      return `hsl(60, 70%, ${lightness}%)`
    } else {
      // Red: 0deg
      const lightness = 80 - ((intensity - 0.66) / 0.34) * 20
      return `hsl(0, 70%, ${lightness}%)`
    }
  }

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Device
              </th>
              {data.dates.map((date, index) => (
                <th
                  key={index}
                  className="border border-gray-300 dark:border-gray-700 px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 min-w-[60px]"
                >
                  {formatDate(date)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.devices.map((device, deviceIndex) => (
              <tr key={device.id} className={deviceIndex % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900/50' : ''}>
                <td className="sticky left-0 z-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">
                  {device.name}
                </td>
                {data.dates.map((date, dateIndex) => {
                  const energy = device.data[date] || 0
                  return (
                    <td
                      key={dateIndex}
                      className="border border-gray-300 dark:border-gray-700 px-2 py-2 text-center text-xs"
                      style={{
                        backgroundColor: getColor(energy),
                        color: energy > 0 ? '#111827' : '#9ca3af',
                        fontWeight: energy > 0 ? 500 : 400,
                      }}
                      title={`${device.name} - ${formatDate(date)}: ${energy.toFixed(2)} kWh`}
                    >
                      {energy > 0 ? energy.toFixed(0) : '-'}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-4 flex-wrap">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border border-gray-300" style={{ backgroundColor: '#f3f4f6' }}></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">No Data</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4" style={{ backgroundColor: getColor(minEnergy + (maxEnergy - minEnergy) * 0.1) }}></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Low ({minEnergy.toFixed(0)} kWh)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4" style={{ backgroundColor: getColor(minEnergy + (maxEnergy - minEnergy) * 0.5) }}></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Medium</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4" style={{ backgroundColor: getColor(maxEnergy) }}></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">High ({maxEnergy.toFixed(0)} kWh)</span>
        </div>
      </div>
    </div>
  )
}
