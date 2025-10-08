// components/DeviceModelSelection.tsx
import { useState, useEffect } from 'react'

interface DeviceModel {
  id: number
  name: string
  manufacturer: string
  model_number: string
  description: string
}

interface DeviceModelSelectionProps {
  onDeviceModelSelect: (deviceModelId: number | null) => void
  selectedDeviceModel: number | null
  disabled?: boolean
}

export default function DeviceModelSelection({
  onDeviceModelSelect,
  selectedDeviceModel,
  disabled = false
}: DeviceModelSelectionProps) {
  const [deviceModels, setDeviceModels] = useState<DeviceModel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCustomConfig, setShowCustomConfig] = useState(false)

  useEffect(() => {
    fetchDeviceModels()
  }, [])

  const fetchDeviceModels = async () => {
    try {
      const response = await fetch('/api/modbus/device-models/')
      if (response.ok) {
        const data = await response.json()
        // Extract the results array from the response
        setDeviceModels(data || [])
      } else {
        console.error('Failed to fetch device models')
        setDeviceModels([])
      }
    } catch (error) {
      console.error('Error fetching device models:', error)
      setDeviceModels([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeviceModelChange = (deviceModelId: string) => {
    if (deviceModelId === 'custom') {
      setShowCustomConfig(true)
      onDeviceModelSelect(null)
    } else if (deviceModelId === '') {
      setShowCustomConfig(false)
      onDeviceModelSelect(null)
    } else {
      setShowCustomConfig(false)
      onDeviceModelSelect(parseInt(deviceModelId))
    }
  }

if (isLoading) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  )
}

return (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
      Select Energy Analyzer Model
    </h3>
    
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Choose from popular devices
        </label>
        <select
          value={selectedDeviceModel || (showCustomConfig ? 'custom' : '')}
          onChange={(e) => handleDeviceModelChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">-- Select a device model --</option>
          {deviceModels.map((model) => (
            <option key={model.id} value={model.id}>
              {model.manufacturer} - {model.name} {model.model_number && `(${model.model_number})`}
            </option>
          ))}
          <option value="custom">Custom Configuration</option>
        </select>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Select your energy analyzer model to auto-configure registers
        </p>
      </div>

      {showCustomConfig && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                Custom Configuration
              </h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p>
                  You've selected custom configuration. You'll need to manually configure all register addresses and parameters.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedDeviceModel && !showCustomConfig && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400">
                Pre-configured Device Selected
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <p>
                  Register addresses and parameters will be automatically configured for this device model.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
)
}
