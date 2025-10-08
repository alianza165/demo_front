'use client'

import { useState, useEffect } from 'react'
import GrafanaDashboard from './GrafanaDashboard'

interface ModbusDevice {
  id: number
  name: string
  grafana_dashboard_url?: string
  grafana_dashboard_uid?: string
  is_active: boolean
}

interface DeviceDashboardSwitcherProps {
  className?: string
}

export default function DeviceDashboardSwitcher({ className = '' }: DeviceDashboardSwitcherProps) {
  const [devices, setDevices] = useState<ModbusDevice[]>([])
  const [selectedDevice, setSelectedDevice] = useState<ModbusDevice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDevices()
  }, [])

  const fetchDevices = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/modbus/devices/')
      
      if (!response.ok) {
        throw new Error('Failed to fetch devices')
      }
      
      const data = await response.json()
      const activeDevices = data.results?.filter((device: ModbusDevice) => device.is_active) || []
      setDevices(activeDevices)
      
      // Auto-select first device with dashboard
      if (activeDevices.length > 0) {
        const deviceWithDashboard = activeDevices.find((device: ModbusDevice) => 
          device.grafana_dashboard_uid || device.grafana_dashboard_url
        )
        setSelectedDevice(deviceWithDashboard || activeDevices[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load devices')
      console.error('Error fetching devices:', err)
    } finally {
      setLoading(false)
    }
  }

  const getDashboardUidFromUrl = (url: string): string | null => {
    try {
      // Extract UID from Grafana dashboard URL
      const match = url.match(/\/d\/([^\/?]+)/)
      return match ? match[1] : null
    } catch {
      return null
    }
  }

if (loading) {
  return (
    <div className={`flex items-center justify-center h-96 ${className}`}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Loading devices...</p>
      </div>
    </div>
  )
}

if (error) {
  return (
    <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className}`}>
      <div className="text-red-700 dark:text-red-400">
        <p className="font-medium">Error loading dashboards</p>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={fetchDevices}
          className="mt-2 px-3 py-1 bg-red-500 dark:bg-red-600 text-white text-sm rounded hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  )
}

if (devices.length === 0) {
  return (
    <div className={`bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center ${className}`}>
      <div className="text-yellow-700 dark:text-yellow-400">
        <p className="font-medium">No active devices found</p>
        <p className="text-sm mt-1">Configure devices in the Modbus section to see their dashboards</p>
      </div>
    </div>
  )
}

const dashboardUid = selectedDevice?.grafana_dashboard_uid || 
  (selectedDevice?.grafana_dashboard_url ? getDashboardUidFromUrl(selectedDevice.grafana_dashboard_url) : null)

return (
  <div className={`space-y-4 ${className}`}>
    {/* Device Selector */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <label htmlFor="device-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Select Device Dashboard
        </label>
        <select
          id="device-select"
          value={selectedDevice?.id || ''}
          onChange={(e) => {
            const device = devices.find(d => d.id === parseInt(e.target.value))
            setSelectedDevice(device || null)
          }}
          className="block w-full sm:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          {devices.map(device => (
            <option key={device.id} value={device.id}>
              {device.name} {!device.grafana_dashboard_uid && !device.grafana_dashboard_url && '(No Dashboard)'}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex items-center space-x-2">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          selectedDevice?.is_active 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
            : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
        }`}>
          {selectedDevice?.is_active ? 'Active' : 'Inactive'}
        </span>
        
        <button
          onClick={fetchDevices}
          className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>

    {/* Dashboard Display */}
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {selectedDevice?.name} - Real-time Monitoring
        </h3>
        {!dashboardUid && (
          <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
            No dashboard configured for this device. Apply configuration to generate dashboard.
          </p>
        )}
      </div>
      
      {dashboardUid ? (
        <GrafanaDashboard 
          dashboardUid={dashboardUid}
          className="h-[600px]"
          from="now-1h"
          to="now"
          theme="dark"
//          theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
        />
      ) : (
        <div className="h-96 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>No dashboard available</p>
            <p className="text-sm mt-1">Apply device configuration to generate dashboard</p>
          </div>
        </div>
      )}
    </div>

    {/* Quick Stats */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-sm font-medium text-blue-800 dark:text-blue-400">Active Devices</span>
        </div>
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{devices.length}</p>
      </div>
      
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-green-500 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-sm font-medium text-green-800 dark:text-green-400">Dashboards</span>
        </div>
        <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
          {devices.filter(d => d.grafana_dashboard_uid || d.grafana_dashboard_url).length}
        </p>
      </div>
      
      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-purple-500 dark:text-purple-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium text-purple-800 dark:text-purple-400">Last Updated</span>
        </div>
        <p className="text-lg font-mono font-bold text-purple-600 dark:text-purple-400 mt-1">
          {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  </div>
)
