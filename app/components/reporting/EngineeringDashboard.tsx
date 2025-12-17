'use client'

import { useState, useEffect } from 'react'
import { Factory, Zap, Droplets, Flame, AlertCircle, Clock } from 'lucide-react'
import { getEngineeringDashboard, type EngineeringDashboard as EngineeringDashboardType } from '../../api/reporting'

interface EngineeringDashboardProps {
  date?: string
}

export default function EngineeringDashboard({ date }: EngineeringDashboardProps) {
  const [data, setData] = useState<EngineeringDashboardType | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await getEngineeringDashboard({ date })
        // Ensure result is an array and get first item
        if (Array.isArray(result) && result.length > 0) {
          setData(result[0])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load engineering dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [date])

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading engineering data...</p>
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

  if (!data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-500 dark:text-gray-400">No engineering dashboard data available</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Factory className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Engineering Dashboard</h2>
        {data.date && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(data.date).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Utilities Production Rate */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Zap className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Utilities Production Rate</h3>
          </div>
          <div className="space-y-2">
            {data.kwh_generated !== null && (
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">KWH Generated:</span>
                <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                  {data.kwh_generated.toLocaleString()} kWh
                </span>
              </div>
            )}
            {data.kw_avg !== null && (
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">KW Avg:</span>
                <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                  {data.kw_avg.toLocaleString()} kW
                </span>
              </div>
            )}
            {data.kw_peak !== null && (
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">KW Peak:</span>
                <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                  {data.kw_peak.toLocaleString()} kW
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Resource Group Status */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Droplets className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Resource Group Status</h3>
          </div>
          <div className="space-y-2">
            {data.avg_flow_tons_per_hr !== null && (
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Avg Flow:</span>
                <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                  {data.avg_flow_tons_per_hr.toLocaleString()} Tons/Hr
                </span>
              </div>
            )}
            {data.husk_kgs !== null && (
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Husk:</span>
                <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                  {data.husk_kgs.toLocaleString()} Kgs
                </span>
              </div>
            )}
            {data.steam_tons !== null && (
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Steam:</span>
                <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                  {data.steam_tons.toLocaleString()} Tons
                </span>
              </div>
            )}
            {data.wastage_kg !== null && (
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Wastage:</span>
                <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                  {data.wastage_kg.toLocaleString()} Kg
                </span>
              </div>
            )}
            {data.gas_availability !== null && (
              <div className="flex items-center space-x-2">
                <Flame className={`w-4 h-4 ${data.gas_availability ? 'text-green-600' : 'text-red-600'}`} />
                <span className="text-sm text-gray-600 dark:text-gray-400">Gas:</span>
                <span className={`ml-2 font-semibold ${data.gas_availability ? 'text-green-600' : 'text-red-600'}`}>
                  {data.gas_availability ? 'Available' : 'Not Available'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Gen-Sets / Others */}
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Gen-Sets / Others</h3>
          </div>
          <div className="space-y-2">
            {data.gen_set_from && data.gen_set_to && (
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Gen-Set Period:</span>
                <div className="ml-2 text-sm text-gray-900 dark:text-white">
                  {new Date(data.gen_set_from).toLocaleTimeString()} - {new Date(data.gen_set_to).toLocaleTimeString()}
                </div>
              </div>
            )}
            {data.gen_set_hours !== null && (
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Gen-Set Hours:</span>
                <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                  {data.gen_set_hours.toFixed(2)} hrs
                </span>
              </div>
            )}
            {data.dg_engine && (
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">DG Engine:</span>
                <span className="ml-2 font-semibold text-gray-900 dark:text-white">{data.dg_engine}</span>
              </div>
            )}
            {data.downtime !== null && (
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-red-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Downtime:</span>
                <span className="ml-2 font-semibold text-red-600">
                  {data.downtime.toFixed(2)} hrs
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

