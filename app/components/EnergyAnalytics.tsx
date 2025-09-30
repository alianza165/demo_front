'use client'

import { useState, useEffect } from 'react'

interface EnergyAnalyticsProps {
  deviceId?: number
}

export default function EnergyAnalytics({ deviceId }: EnergyAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d')
  const [energyData, setEnergyData] = useState<any[]>([])
  const [comparisonData, setComparisonData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange, deviceId])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      
      if (deviceId) {
        // Get single device data
        const response = await fetch(
          `/api/analytics/energy-summaries/by_device/?device_id=${deviceId}&days=${
            timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30
          }`
        )
        const data = await response.json()
        setEnergyData(data)
      } else {
        // Get device comparison data
        const response = await fetch(
          `/api/analytics/energy-summaries/compare_devices/?days=${
            timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30
          }`
        )
        const data = await response.json()
        setComparisonData(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Time range selector */}
      <div className="flex space-x-2">
        {['24h', '7d', '30d'].map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range as any)}
            className={`px-3 py-1 rounded text-sm ${
              timeRange === range
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Analytics content */}
      {deviceId ? (
        <DeviceAnalytics 
          data={energyData} 
          loading={loading} 
          timeRange={timeRange} 
        />
      ) : (
        <ComparisonAnalytics 
          data={comparisonData} 
          loading={loading} 
          timeRange={timeRange} 
        />
      )}
    </div>
  )
}
