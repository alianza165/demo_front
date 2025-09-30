'use client'

import { useState, useEffect } from 'react'

interface ShiftAnalysisProps {
  timeRange: '24h' | '7d' | '30d'
}

interface ShiftData {
  id: number
  shift_name: string
  total_energy_kwh: number
  total_cost: number
  units_produced: number
  energy_per_unit: number
  cost_per_unit: number
  shift_date: string
}

export default function ShiftAnalysis({ timeRange }: ShiftAnalysisProps) {
  const [data, setData] = useState<ShiftData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchShiftData()
  }, [timeRange])

  const fetchShiftData = async () => {
    try {
      setLoading(true)
      const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30
      
      const response = await fetch(
        `/api/analytics/shift-energy/?days=${days}`
      )
      
      if (response.ok) {
        const result = await response.json()
        setData(Array.isArray(result) ? result : [])
      } else {
        console.error('Failed to fetch shift data')
        setData([])
      }
    } catch (error) {
      console.error('Error fetching shift data:', error)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading shift analysis...</p>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>No shift data available</p>
          <p className="text-sm mt-1">Configure shifts and run energy aggregation</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shift Efficiency */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Shift Efficiency</h3>
          <div className="space-y-4">
            {data
              .filter(shift => shift.units_produced > 0)
              .sort((a, b) => a.energy_per_unit - b.energy_per_unit)
              .slice(0, 5)
              .map((shift, index) => (
                <div key={shift.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{shift.shift_name}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(shift.shift_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {shift.energy_per_unit.toFixed(2)} kWh/unit
                    </div>
                    <div className="text-sm text-gray-600">
                      {shift.units_produced} units
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Shift Costs */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Shift Costs</h3>
          <div className="space-y-4">
            {data
              .sort((a, b) => b.total_cost - a.total_cost)
              .slice(0, 5)
              .map((shift, index) => (
                <div key={shift.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{shift.shift_name}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(shift.shift_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600">
                      ${shift.total_cost.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {shift.total_energy_kwh.toFixed(1)} kWh
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-blue-600 text-sm font-medium">Total Shifts</div>
          <div className="text-2xl font-bold text-blue-700">{data.length}</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-green-600 text-sm font-medium">Avg Energy/Unit</div>
          <div className="text-2xl font-bold text-green-700">
            {(
              data
                .filter(s => s.units_produced > 0)
                .reduce((sum, s) => sum + s.energy_per_unit, 0) /
              data.filter(s => s.units_produced > 0).length || 0
            ).toFixed(2)} kWh
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-purple-600 text-sm font-medium">Total Cost</div>
          <div className="text-2xl font-bold text-purple-700">
            ${data.reduce((sum, s) => sum + s.total_cost, 0).toFixed(2)}
          </div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="text-orange-600 text-sm font-medium">Most Efficient</div>
          <div className="text-lg font-bold text-orange-700 truncate">
            {data
              .filter(s => s.units_produced > 0)
              .reduce((min, s) => 
                s.energy_per_unit < min.energy_per_unit ? s : min, 
                { energy_per_unit: Infinity, shift_name: 'N/A' } as any
              ).shift_name}
          </div>
        </div>
      </div>
    </div>
  )
}
