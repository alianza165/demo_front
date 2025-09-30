'use client'

import { useState, useEffect } from 'react'

interface DeviceComparisonProps {
  timeRange: '24h' | '7d' | '30d'
}

interface DeviceComparisonData {
  device_id: number
  device_name: string
  total_energy: number
  total_cost: number
  avg_power: number
}

export default function DeviceComparison({ timeRange }: DeviceComparisonProps) {
  const [data, setData] = useState<DeviceComparisonData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<'energy' | 'cost' | 'power'>('energy')

  useEffect(() => {
    fetchComparisonData()
  }, [timeRange])

  const fetchComparisonData = async () => {
    try {
      setLoading(true)
      const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30
      
      const response = await fetch(
        `/api/analytics/energy-summaries/compare_devices/?days=${days}`
      )
      
      if (response.ok) {
        const result = await response.json()
        setData(Array.isArray(result) ? result : [])
      } else {
        console.error('Failed to fetch comparison data')
        setData([])
      }
    } catch (error) {
      console.error('Error fetching device comparison:', error)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const getMetricValue = (device: DeviceComparisonData) => {
    switch (selectedMetric) {
      case 'energy':
        return device.total_energy
      case 'cost':
        return device.total_cost
      case 'power':
        return device.avg_power
      default:
        return device.total_energy
    }
  }

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case 'energy':
        return 'Energy (kWh)'
      case 'cost':
        return 'Cost ($)'
      case 'power':
        return 'Power (kW)'
      default:
        return 'Energy (kWh)'
    }
  }

  const getMaxValue = () => {
    if (data.length === 0) return 100
    return Math.max(...data.map(d => getMetricValue(d))) * 1.1
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading device comparison...</p>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p>No device comparison data available</p>
          <p className="text-sm mt-1">Data will appear after energy aggregation runs</p>
        </div>
      </div>
    )
  }

  const maxValue = getMaxValue()

  return (
    <div className="space-y-6">
      {/* Metric Selector */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'energy' as const, name: 'Energy Consumption', color: 'bg-blue-500' },
          { id: 'cost' as const, name: 'Energy Cost', color: 'bg-green-500' },
          { id: 'power' as const, name: 'Average Power', color: 'bg-purple-500' },
        ].map(metric => (
          <button
            key={metric.id}
            onClick={() => setSelectedMetric(metric.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedMetric === metric.id
                ? `${metric.color} text-white`
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {metric.name}
          </button>
        ))}
      </div>

      {/* Comparison Bars */}
      <div className="space-y-4">
        {data.map((device, index) => {
          const value = getMetricValue(device)
          const percentage = (value / maxValue) * 100
          
          return (
            <div key={device.device_id} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-900">{device.device_name}</span>
                <span className="text-gray-600">
                  {selectedMetric === 'cost' ? `$${value.toFixed(2)}` : 
                   selectedMetric === 'power' ? `${value.toFixed(1)} kW` : 
                   `${value.toFixed(1)} kWh`}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-blue-600 text-sm font-medium">Total Energy</div>
          <div className="text-2xl font-bold text-blue-700">
            {data.reduce((sum, device) => sum + device.total_energy, 0).toFixed(1)} kWh
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-green-600 text-sm font-medium">Total Cost</div>
          <div className="text-2xl font-bold text-green-700">
            ${data.reduce((sum, device) => sum + device.total_cost, 0).toFixed(2)}
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-purple-600 text-sm font-medium">Most Consumption</div>
          <div className="text-lg font-bold text-purple-700 truncate">
            {data.reduce((max, device) => 
              device.total_energy > max.total_energy ? device : max
            ).device_name}
          </div>
        </div>
      </div>
    </div>
  )
}
