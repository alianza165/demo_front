// app/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import GrafanaDashboard from '../components/GrafanaDashboard'

interface SystemStatus {
  total_energy: number
  current_power: number
  devices_online: number
  total_devices: number
  last_updated: string
}

export default function DashboardPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSystemStatus()
  }, [])

  const fetchSystemStatus = async () => {
    try {
      // This would call your Django backend
      const response = await fetch('http://your-django-backend/api/system/status/')
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch (error) {
      console.error('Error fetching system status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = () => {
    setIsLoading(true)
    fetchSystemStatus()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Energy Dashboard</h1>
        <button 
          onClick={refreshData}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border rounded-lg">
          <h3 className="font-semibold text-gray-600">Total Energy</h3>
          <p className="text-2xl font-bold">
            {status ? `${status.total_energy.toLocaleString()} kWh` : 'Loading...'}
          </p>
        </div>
        <div className="p-4 bg-white border rounded-lg">
          <h3 className="font-semibold text-gray-600">Current Power</h3>
          <p className="text-2xl font-bold">
            {status ? `${status.current_power} kW` : 'Loading...'}
          </p>
        </div>
        <div className="p-4 bg-white border rounded-lg">
          <h3 className="font-semibold text-gray-600">Devices Online</h3>
          <p className="text-2xl font-bold">
            {status ? `${status.devices_online}/${status.total_devices}` : 'Loading...'}
          </p>
        </div>
        <div className="p-4 bg-white border rounded-lg">
          <h3 className="font-semibold text-gray-600">Last Updated</h3>
          <p className="text-sm">
            {status ? new Date(status.last_updated).toLocaleString() : 'Loading...'}
          </p>
        </div>
      </div>

      {/* Grafana Dashboard */}
      <div className="bg-white p-4 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Real-time Monitoring</h2>
        <GrafanaDashboard 
          dashboardUid="c3e22078-7f5b-4896-beca-15712aeac438" // Replace with your actual dashboard UID
          className="h-[600px]"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-3">Quick Actions</h3>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-blue-500 text-white rounded text-sm">
            Export Data
          </button>
          <button className="px-4 py-2 bg-green-500 text-white rounded text-sm">
            Generate Report
          </button>
          <button className="px-4 py-2 bg-orange-500 text-white rounded text-sm">
            View Alerts
          </button>
        </div>
      </div>
    </div>
  )
}
