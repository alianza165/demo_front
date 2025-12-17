'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Zap, Building2 } from 'lucide-react'
import { getCapacityLoads, type CapacityLoad as CapacityLoadType } from '../../api/reporting'

interface CapacityLoadProps {
  processArea?: string
  location?: string
}

export default function CapacityLoad({ processArea, location }: CapacityLoadProps) {
  const [data, setData] = useState<CapacityLoadType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : []

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await getCapacityLoads({
          process_area: processArea,
          location: location,
          is_active: true,
        })
        // Ensure result is an array
        setData(Array.isArray(result) ? result : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load capacity load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [processArea, location])

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading capacity data...</p>
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

  // Group by equipment type
  const groupedData = safeData.reduce((acc, item) => {
    if (!acc[item.equipment_type]) {
      acc[item.equipment_type] = []
    }
    acc[item.equipment_type].push(item)
    return acc
  }, {} as Record<string, CapacityLoadType[]>)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center space-x-2 mb-6">
        <BarChart3 className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Capacity & Load</h2>
      </div>

      {safeData.length === 0 || Object.keys(groupedData).length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No capacity load data available</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedData).map(([equipmentType, items]) => (
            <div key={equipmentType} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 capitalize">
                {equipmentType.replace('_', ' ')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                      <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                        {item.location}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{item.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Power/Unit:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {item.power_per_unit_kw} kW
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Load:</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {item.total_load_kw.toFixed(2)} kW
                        </span>
                      </div>
                      {item.daily_kwh && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Daily:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {item.daily_kwh.toFixed(2)} kWh
                          </span>
                        </div>
                      )}
                      {item.monthly_kwh && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Monthly:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {item.monthly_kwh.toFixed(2)} kWh
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Process:</span>
                        <span className="font-semibold text-gray-900 dark:text-white capitalize">
                          {item.process_area}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

