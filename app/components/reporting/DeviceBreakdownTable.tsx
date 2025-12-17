'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface DeviceBreakdownRow {
  device_id: number
  device_name: string
  device_type: string
  department?: string
  process?: string
  process_area?: string
  floor?: string
  load_type?: string
  machine_type?: string
  location: string
  total_energy_kwh: number
  avg_daily_energy_kwh: number
  peak_power_kw: number
  total_cost_usd: number
  component_breakdown: Record<string, number>
  units_produced?: number | null
  efficiency_kwh_per_unit?: number | null
}

interface DeviceBreakdownTableProps {
  data: {
    results: DeviceBreakdownRow[]
    count: number
    page: number
    page_size: number
    total_pages: number
  }
  onPageChange?: (page: number) => void
}

export default function DeviceBreakdownTable({ data, onPageChange }: DeviceBreakdownTableProps) {
  const [currentPage, setCurrentPage] = useState(data.page)

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= data.total_pages) {
      setCurrentPage(newPage)
      if (onPageChange) {
        onPageChange(newPage)
      }
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Device Breakdown ({data.count} devices)
        </h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <span>
            Page {data.page} of {data.total_pages}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Device</th>
              <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Type</th>
              <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Process</th>
              <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Floor</th>
              <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Load Type</th>
              <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Location</th>
              <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300">Total Energy (kWh)</th>
              <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300">Avg Daily (kWh)</th>
              <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300">Peak Power (kW)</th>
                  <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300">Total Cost (PKR)</th>
              <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300">Units Produced</th>
              <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300">Efficiency (kWh/Unit)</th>
            </tr>
          </thead>
          <tbody>
              {data.results.length === 0 ? (
              <tr>
                <td colSpan={12} className="text-center p-8 text-gray-500 dark:text-gray-400">
                  No data available
                </td>
              </tr>
            ) : (
              data.results.map((row) => (
                <tr
                  key={row.device_id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="p-3 font-medium text-gray-900 dark:text-white">{row.device_name}</td>
                  <td className="p-3 text-gray-700 dark:text-gray-300">{row.device_type}</td>
                  <td className="p-3 text-gray-700 dark:text-gray-300 capitalize">{row.process_area || row.process || row.department || '-'}</td>
                  <td className="p-3 text-gray-700 dark:text-gray-300">{row.floor || '-'}</td>
                  <td className="p-3 text-gray-700 dark:text-gray-300">{row.load_type || '-'}</td>
                  <td className="p-3 text-gray-700 dark:text-gray-300">{row.location || '-'}</td>
                  <td className="p-3 text-right text-gray-700 dark:text-gray-300">
                    {row.total_energy_kwh.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right text-gray-700 dark:text-gray-300">
                    {row.avg_daily_energy_kwh.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right text-gray-700 dark:text-gray-300">
                    {row.peak_power_kw.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right font-semibold text-gray-900 dark:text-white">
                    PKR {row.total_cost_usd.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </td>
                  <td className="p-3 text-right text-gray-700 dark:text-gray-300">
                    {row.units_produced?.toLocaleString() || '-'}
                  </td>
                  <td className="p-3 text-right text-gray-700 dark:text-gray-300">
                    {row.efficiency_kwh_per_unit?.toFixed(2) || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data.total_pages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center space-x-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
          <div className="flex space-x-2">
            {Array.from({ length: Math.min(5, data.total_pages) }, (_, i) => {
              let pageNum
              if (data.total_pages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= data.total_pages - 2) {
                pageNum = data.total_pages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 rounded ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === data.total_pages}
            className="flex items-center space-x-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

