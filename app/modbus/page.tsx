// app/modbus/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ModbusRegister {
  id: number
  address: number
  name: string
  data_type: string
  scale_factor: number
  unit: string
  order: number
  category: string
  is_active: boolean
  device_model: number | null
  device: number
}

interface ModbusDevice {
  id: number
  name: string
  port: string
  address: number
  baud_rate: number
  parity: string
  stop_bits: number
  byte_size: number
  timeout: number
  is_active: boolean
  location: string
  description: string
  created_at: string
  updated_at: string
  device_model: number | null
  device_model_name?: string
  registers: ModbusRegister[]
}

interface ApiResponse {
  count: number
  next: string | null
  previous: string | null
  results: ModbusDevice[]
}

export default function ModbusPage() {
  const [devices, setDevices] = useState<ModbusDevice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDevices()
  }, [])

  const fetchDevices = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('http://192.168.1.20:8000/api/modbus/devices/')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch devices: ${response.status}`)
      }
      
      const data: ApiResponse = await response.json()
      setDevices(data.results)
    } catch (error) {
      console.error('Error fetching devices:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch devices')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyConfig = async (deviceId: number) => {
    try {
      // You'll need to implement this API call based on your backend
      const response = await fetch(`http://192.168.1.20:8000/api/modbus/devices/${deviceId}/apply/`, {
        method: 'POST',
      })
      
      if (response.ok) {
        alert('Configuration applied successfully!')
        // Optionally refresh the device list
        fetchDevices()
      } else {
        throw new Error('Failed to apply configuration')
      }
    } catch (error) {
      console.error('Error applying configuration:', error)
      alert('Failed to apply configuration')
    }
  }

  const handleDeleteDevice = async (deviceId: number) => {
    if (!confirm('Are you sure you want to delete this device?')) return

    try {
      const response = await fetch(`http://192.168.1.20:8000/api/modbus/devices/${deviceId}/`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        alert('Device deleted successfully!')
        fetchDevices() // Refresh the list
      } else {
        throw new Error('Failed to delete device')
      }
    } catch (error) {
      console.error('Error deleting device:', error)
      alert('Failed to delete device')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Modbus Devices</h1>
          <Link 
            href="/modbus/config"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add New Device
          </Link>
        </div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
        <button
          onClick={fetchDevices}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Modbus Devices</h1>
          <p className="text-gray-600 mt-1">
            Total devices: {devices.length}
          </p>
        </div>
        <Link 
          href="/modbus/config"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Add New Device
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {devices.map((device) => (
          <div key={device.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Device Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{device.name}</h3>
                  {device.device_model_name && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">{device.device_model_name}</p>
                  )}
                </div>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    device.is_active ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {device.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Device Details */}
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Address:</span>
                  <span className="font-mono">{device.address}</span>
                </div>
                <div className="flex justify-between">
                  <span>Port:</span>
                  <span className="font-mono">{device.port}</span>
                </div>
                <div className="flex justify-between">
                  <span>Baud Rate:</span>
                  <span>{device.baud_rate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Registers:</span>
                  <span>{device.registers.length} configured</span>
                </div>
                {device.location && (
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span>{device.location}</span>
                  </div>
                )}
              </div>

              {/* Register Preview */}
              {device.registers.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700 dark:border-gray-300">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Registers:</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {device.registers.slice(0, 3).map((register) => (
                      <div key={register.id} className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400 truncate">{register.name}</span>
                        <span className="text-gray-500 font-mono">
                          0x{register.address.toString(16).toUpperCase()}
                        </span>
                      </div>
                    ))}
                    {device.registers.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{device.registers.length - 3} more registers
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex space-x-2">
                <Link 
                  href={`/modbus/config?id=${device.id}`}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors text-center"
                >
                  Edit
                </Link>
                <button 
                  onClick={() => handleApplyConfig(device.id)}
                  className="px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                >
                  Apply
                </button>
                <button 
                  onClick={() => handleDeleteDevice(device.id)}
                  className="px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>

              {/* Last Updated */}
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-300">
                <p className="text-xs text-gray-500">
                  Updated: {new Date(device.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {devices.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No Modbus devices</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first Modbus device configuration.</p>
            <Link 
              href="/modbus/config"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add Your First Device
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
