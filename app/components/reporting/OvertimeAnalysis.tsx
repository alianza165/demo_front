'use client'

import { useState, useEffect } from 'react'
import { Clock, TrendingUp, AlertTriangle } from 'lucide-react'
import { getDailyAggregates, type DailyAggregate } from '../../api/reporting'

interface OvertimeAnalysisProps {
  date?: string
  month?: string
  processArea?: string
}

export default function OvertimeAnalysis({ date, month, processArea }: OvertimeAnalysisProps) {
  const [regularData, setRegularData] = useState<DailyAggregate[]>([])
  const [overtimeData, setOvertimeData] = useState<DailyAggregate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Ensure data is always arrays
  const safeRegularData = Array.isArray(regularData) ? regularData : []
  const safeOvertimeData = Array.isArray(overtimeData) ? overtimeData : []

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const params: any = {
          process_area: processArea,
        }
        if (date) params.date = date
        if (month) params.date = `${month}-01`

        // Fetch both regular and overtime data
        const [regular, overtime] = await Promise.all([
          getDailyAggregates({ ...params, is_overtime: false }),
          getDailyAggregates({ ...params, is_overtime: true }),
        ])
        
        // Ensure both are arrays
        setRegularData(Array.isArray(regular) ? regular : [])
        setOvertimeData(Array.isArray(overtime) ? overtime : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load overtime data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [date, month, processArea])

  const regularTotal = safeRegularData.reduce((sum, item) => sum + (item.total_energy_kwh || 0), 0)
  const overtimeTotal = safeOvertimeData.reduce((sum, item) => sum + (item.total_energy_kwh || 0), 0)
  const totalEnergy = regularTotal + overtimeTotal
  const overtimePercentage = totalEnergy > 0 ? (overtimeTotal / totalEnergy) * 100 : 0

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading overtime analysis...</p>
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Clock className="w-6 h-6 text-orange-600" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Overtime Analysis</h2>
      </div>

      {safeOvertimeData.length === 0 ? (
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400">No overtime data available for the selected period</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Regular Hours</span>
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {regularTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })} kWh
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {safeRegularData.length} devices
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overtime Hours</span>
              </div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {overtimeTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })} kWh
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {safeOvertimeData.length} devices
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overtime %</span>
              </div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {overtimePercentage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                of total consumption
              </div>
            </div>
          </div>

          {/* Overtime Devices Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Device</th>
                  <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Floor</th>
                  <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300">Regular (kWh)</th>
                  <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300">Overtime (kWh)</th>
                  <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300">Total (kWh)</th>
                  <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300">Overtime %</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(new Set([...safeRegularData, ...safeOvertimeData].map(d => d.device))).map((deviceId) => {
                  const regular = safeRegularData.find(d => d.device === deviceId)
                  const overtime = safeOvertimeData.find(d => d.device === deviceId)
                  const regKwh = regular?.total_energy_kwh || 0
                  const otKwh = overtime?.total_energy_kwh || 0
                  const total = regKwh + otKwh
                  const otPct = total > 0 ? (otKwh / total) * 100 : 0

                  if (otKwh === 0) return null

                  return (
                    <tr
                      key={deviceId}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="p-3 font-medium text-gray-900 dark:text-white">
                        {regular?.device_name || overtime?.device_name || `Device ${deviceId}`}
                      </td>
                      <td className="p-3 text-gray-700 dark:text-gray-300">
                        {regular?.device_floor || overtime?.device_floor || '-'}
                      </td>
                      <td className="p-3 text-right text-gray-700 dark:text-gray-300">
                        {regKwh.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-semibold text-orange-600 dark:text-orange-400">
                        {otKwh.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right text-gray-700 dark:text-gray-300">
                        {total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right">
                        <span className={`font-semibold ${otPct > 20 ? 'text-red-600' : otPct > 10 ? 'text-orange-600' : 'text-green-600'}`}>
                          {otPct.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

