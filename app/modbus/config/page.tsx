// app/modbus/config/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import ModbusConfigForm from '../../components/ModbusConfigForm'

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

export default function ModbusConfigPage() {
  const searchParams = useSearchParams()
  const deviceId = searchParams.get('id')
  const [device, setDevice] = useState<ModbusDevice | null>(null)
  const [isLoading, setIsLoading] = useState(!!deviceId)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (deviceId) {
      fetchDevice(parseInt(deviceId))
    } else {
      setIsLoading(false)
    }
  }, [deviceId])

  const fetchDevice = async (id: number) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Use the proxy API route
      const response = await fetch(`/api/modbus/devices/${id}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch device: ${response.status}`)
      }
      
      const data = await response.json()
      setDevice(data)
    } catch (error) {
      console.error('Error fetching device:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch device')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfigSuccess = () => {
    // Refresh device data if we're in edit mode
    if (deviceId) {
      fetchDevice(parseInt(deviceId))
    }
  }

if (isLoading) {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading device configuration...</p>
      </div>
    </div>
  )
}

if (error) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {deviceId ? 'Edit Modbus Device' : 'Add New Modbus Device'}
        </h1>
      </div>
      
      <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
        <strong>Error loading device:</strong> {error}
        <div className="mt-2">
          <button
            onClick={() => deviceId && fetchDevice(parseInt(deviceId))}
            className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  )
}

return (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {device ? `Edit ${device.name}` : 'Add New Modbus Device'}
        </h1>
        {device && (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            device.is_active 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
          }`}>
            {device.is_active ? 'Active' : 'Inactive'}
          </span>
        )}
      </div>
      
      {device && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {new Date(device.updated_at).toLocaleDateString()}
        </div>
      )}
    </div>

    {/* Device info summary for edit mode */}
    {device && (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-semibold text-blue-800 dark:text-blue-300">Device ID:</span>
            <p className="text-blue-700 dark:text-blue-400">{device.id}</p>
          </div>
          <div>
            <span className="font-semibold text-blue-800 dark:text-blue-300">Port:</span>
            <p className="text-blue-700 dark:text-blue-400 font-mono">{device.port}</p>
          </div>
          <div>
            <span className="font-semibold text-blue-800 dark:text-blue-300">Address:</span>
            <p className="text-blue-700 dark:text-blue-400">{device.address}</p>
          </div>
          <div>
            <span className="font-semibold text-blue-800 dark:text-blue-300">Baud Rate:</span>
            <p className="text-blue-700 dark:text-blue-400">{device.baud_rate}</p>
          </div>
        </div>
        {device.location && (
          <div className="mt-2">
            <span className="font-semibold text-blue-800 dark:text-blue-300">Location:</span>
            <p className="text-blue-700 dark:text-blue-400">{device.location}</p>
          </div>
        )}
      </div>
    )}

      <ModbusConfigForm 
        initialDevice={device}
        onConfigSuccess={handleConfigSuccess}
      />
    </div>
  )
}
