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
    // Initialize with dummy data
    const initialData: SystemStatus = {
      total_energy: 12450,
      current_power: 87.5,
      devices_online: 8,
      total_devices: 12,
      last_updated: new Date().toISOString()
    }
    setStatus(initialData)
    setIsLoading(false)

    // Set up interval to update values
    const intervalId = setInterval(updateDummyData, 3000)
    
    return () => clearInterval(intervalId)
  }, [])

  const updateDummyData = () => {
    if (status) {
      // Create small random fluctuations
      const powerFluctuation = (Math.random() - 0.5) * 10
      const newPower = Math.max(50, Math.min(120, status.current_power + powerFluctuation))
      
      // Slowly increment total energy based on current power
      const energyIncrement = (newPower / 3600) * 3 // kWh added in 3 seconds
      
      // Randomly change online devices (but keep within limits)
      const deviceChange = Math.random() > 0.9 ? (Math.random() > 0.5 ? 1 : -1) : 0
      const newOnlineDevices = Math.max(
        6, 
        Math.min(status.total_devices, status.devices_online + deviceChange)
      )

      setStatus({
        total_energy: parseFloat((status.total_energy + energyIncrement).toFixed(3)),
        current_power: parseFloat(newPower.toFixed(2)),
        devices_online: newOnlineDevices,
        total_devices: status.total_devices,
        last_updated: new Date().toISOString()
      })
    }
  }

  const refreshData = () => {
    setIsLoading(true)
    // Simulate API call delay
    setTimeout(() => {
      if (status) {
        setStatus({
          ...status,
          last_updated: new Date().toISOString()
        })
      }
      setIsLoading(false)
    }, 800)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Energy Dashboard</h1>
        <button 
          onClick={refreshData}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="font-semibold text-gray-600 text-sm mb-1">Total Energy</h3>
          <p className="text-2xl font-bold text-blue-600">
            {status ? `${status.total_energy.toLocaleString(undefined, { maximumFractionDigits: 1 })} kWh` : 'Loading...'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Since system start</p>
        </div>
        
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="font-semibold text-gray-600 text-sm mb-1">Current Power</h3>
          <p className="text-2xl font-bold text-green-600">
            {status ? `${status.current_power} kW` : 'Loading...'}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-1000" 
              style={{ width: `${Math.min(100, (status?.current_power || 0) / 120 * 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Real-time consumption</p>
        </div>
        
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="font-semibold text-gray-600 text-sm mb-1">Devices Online</h3>
          <p className="text-2xl font-bold text-purple-600">
            {status ? `${status.devices_online}/${status.total_devices}` : 'Loading...'}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${(status?.devices_online || 0) / (status?.total_devices || 1) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Connected devices</p>
        </div>
        
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="font-semibold text-gray-600 text-sm mb-1">Last Updated</h3>
          <p className="text-lg font-mono font-bold text-orange-600">
            {status ? new Date(status.last_updated).toLocaleTimeString() : 'Loading...'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {status ? new Date(status.last_updated).toLocaleDateString() : ''}
          </p>
        </div>
      </div>

      {/* Grafana Dashboard */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Real-time Monitoring</h2>
        <GrafanaDashboard 
          dashboardUid="c3e22078-7f5b-4896-beca-15712aeac438"
          className="h-[600px]"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors">
            Export Data
          </button>
          <button className="px-4 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors">
            Generate Report
          </button>
          <button className="px-4 py-2 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 transition-colors">
            View Alerts
          </button>
          <button className="px-4 py-2 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 transition-colors">
            Device Management
          </button>
        </div>
      </div>

      {/* Data Simulation Notice */}
      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-center">
        <p className="text-yellow-700 text-sm">
          <span className="font-medium">Demo Mode:</span> Displaying simulated data that updates every 3 seconds
        </p>
      </div>
    </div>
  )
}
