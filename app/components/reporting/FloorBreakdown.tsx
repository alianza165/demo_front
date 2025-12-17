'use client'

import { useState, useEffect } from 'react'
import { Building2, TrendingUp } from 'lucide-react'
import { getDailyAggregates, type DailyAggregate } from '../../api/reporting'
import EnergyMixChart from './EnergyMixChart'

interface FloorBreakdownProps {
  date?: string
  month?: string
  processArea?: string
}

export default function FloorBreakdown({ date, month, processArea }: FloorBreakdownProps) {
  const [data, setData] = useState<DailyAggregate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : []

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const params: any = {
          process_area: processArea,
          is_overtime: false,
        }
        if (date) params.date = date
        if (month) params.date = `${month}-01`
        
        const result = await getDailyAggregates(params)
        // Ensure result is an array
        setData(Array.isArray(result) ? result : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load floor breakdown')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [date, month, processArea])

  // Group by floor
  const floorData = safeData.reduce((acc, item) => {
    const floor = item.device_floor || 'none'
    if (!acc[floor]) {
      acc[floor] = {
        floor,
        total_kwh: 0,
        device_count: 0,
        components: {} as Record<string, number>,
      }
    }
    acc[floor].total_kwh += item.total_energy_kwh
    acc[floor].device_count += 1
    
    // Aggregate component breakdown
    Object.entries(item.component_breakdown || {}).forEach(([component, value]) => {
      acc[floor].components[component] = (acc[floor].components[component] || 0) + value
    })
    
    return acc
  }, {} as Record<string, { floor: string; total_kwh: number; device_count: number; components: Record<string, number> }>)

  const floors = ['GF', 'FF', 'SF', 'WF'].filter(f => floorData[f])

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading floor breakdown...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-red-600 dark:text-red-400">{error}</div>
      </div>
    )
  }

  if (safeData.length === 0 || floors.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-500 dark:text-gray-400">No floor breakdown data available</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Building2 className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Floor-wise Breakdown</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {floors.map((floor) => {
          const floorInfo = floorData[floor]
          const floorNames: Record<string, string> = {
            GF: 'Ground Floor',
            FF: 'First Floor',
            SF: 'Second Floor',
            WF: 'Washing Floor',
          }
          
          return (
            <div
              key={floor}
              className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {floorNames[floor] || floor}
                </h3>
                <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded">
                  {floorInfo.device_count} devices
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {floorInfo.total_kwh.toLocaleString(undefined, { maximumFractionDigits: 0 })} kWh
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Avg: {(floorInfo.total_kwh / 24).toFixed(2)} kW
              </div>
            </div>
          )
        })}
      </div>

      {/* Energy Mix by Floor */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {floors.map((floor) => {
          const floorInfo = floorData[floor]
          const components = Object.entries(floorInfo.components).map(([name, value]) => ({
            name: name.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
            value: round(value, 2),
            percentage: round((value / floorInfo.total_kwh) * 100, 2),
            color: getComponentColor(name),
          }))

          const floorNames: Record<string, string> = {
            GF: 'Ground Floor',
            FF: 'First Floor',
            SF: 'Second Floor',
            WF: 'Washing Floor',
          }

          return (
            <EnergyMixChart
              key={floor}
              energyMix={{
                device_name: floorNames[floor] || floor,
                total_kwh: floorInfo.total_kwh,
                load_kw: floorInfo.total_kwh / 24,
                components: components.sort((a, b) => b.value - a.value),
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

function round(value: number, decimals: number): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

function getComponentColor(component: string): string {
  const colors: Record<string, string> = {
    machines: '#FF6384',
    lights: '#FFCE56',
    hvac: '#36A2EB',
    exhaust_fan: '#4BC0C0',
    office: '#9966FF',
    laser: '#FF9F40',
  }
  return colors[component.toLowerCase()] || '#999999'
}

