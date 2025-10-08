'use client'

import { useState, useEffect } from 'react'
import DeviceDashboardSwitcher from '../components/DeviceDashboardSwitcher'

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
  const [activeTab, setActiveTab] = useState<'overview' | 'devices'>('overview')

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Energy Dashboard</h1>
        <button 
          onClick={refreshData}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            System Overview
          </button>
          <button
            onClick={() => setActiveTab('devices')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'devices'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Device Dashboards
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* System Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-600 dark:text-gray-400 text-sm mb-1">Total Energy</h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {status ? `${status.total_energy.toLocaleString(undefined, { maximumFractionDigits: 1 })} kWh` : 'Loading...'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Since system start</p>
            </div>
            
            <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-600 dark:text-gray-400 text-sm mb-1">Current Power</h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {status ? `${status.current_power} kW` : 'Loading...'}
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-500 dark:bg-green-600 h-2 rounded-full transition-all duration-1000" 
                  style={{ width: `${Math.min(100, (status?.current_power || 0) / 120 * 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Real-time consumption</p>
            </div>
            
            <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-600 dark:text-gray-400 text-sm mb-1">Devices Online</h3>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {status ? `${status.devices_online}/${status.total_devices}` : 'Loading...'}
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-500 dark:bg-purple-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${(status?.devices_online || 0) / (status?.total_devices || 1) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Connected devices</p>
            </div>
            
            <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-600 dark:text-gray-400 text-sm mb-1">Last Updated</h3>
              <p className="text-lg font-mono font-bold text-orange-600 dark:text-orange-400">
                {status ? new Date(status.last_updated).toLocaleTimeString() : 'Loading...'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {status ? new Date(status.last_updated).toLocaleDateString() : ''}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-800 dark:text-blue-400 mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded text-sm hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors">
                Export Data
              </button>
              <button className="px-4 py-2 bg-green-500 dark:bg-green-600 text-white rounded text-sm hover:bg-green-600 dark:hover:bg-green-700 transition-colors">
                Generate Report
              </button>
              <button className="px-4 py-2 bg-orange-500 dark:bg-orange-600 text-white rounded text-sm hover:bg-orange-600 dark:hover:bg-orange-700 transition-colors">
                View Alerts
              </button>
              <button 
                onClick={() => setActiveTab('devices')}
                className="px-4 py-2 bg-purple-500 dark:bg-purple-600 text-white rounded text-sm hover:bg-purple-600 dark:hover:bg-purple-700 transition-colors"
              >
                View Device Dashboards
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'devices' && (
        <DeviceDashboardSwitcher />
      )}

      {/* Data Simulation Notice */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 text-center">
        <p className="text-yellow-700 dark:text-yellow-400 text-sm">
          <span className="font-medium">Demo Mode:</span> System overview shows simulated data. Device dashboards show real data.
        </p>
      </div>
    </div>
  )
