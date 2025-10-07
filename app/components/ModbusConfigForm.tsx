// components/ModbusConfigForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Button from './ui/Button'
import Input from './ui/Input'
import { useModbusDevices } from '../hooks/useModbusDevices'
import DeviceModelSelection from './DeviceModelSelection'
import RegisterConfiguration from './RegisterConfiguration'

interface ModbusDevice {
  id: number
  name: string
  address: number
  baud_rate: number
  parity: string
  stop_bits: number
  byte_size: number
  timeout: number
  port: string
  registers: ModbusRegister[]
}

interface ModbusRegister {
  id: number
  address: number
  name: string
  data_type: string
  scale_factor: number
  unit: string
  order: number
}

interface ModbusDeviceForm {
  name: string
  address: number
  baud_rate: number
  parity: string
  stop_bits: number
  byte_size: number
  timeout: number
  port: string
}

interface ModbusRegisterForm {
  address: number
  name: string
  data_type: string
  scale_factor: number
  unit: string
  order: number
}

interface ModbusConfigFormProps {
  initialDevice?: ModbusDevice | null;
  onConfigSuccess?: () => void;
}

export default function ModbusConfigForm({
  initialDevice = null,
  onConfigSuccess
}: ModbusConfigFormProps) {
  const {
    devices,
    loading,
    error,
    createDevice,
    updateDevice,
    deleteDevice,
    applyConfiguration,
  } = useModbusDevices()

  const [selectedDevice, setSelectedDevice] = useState<ModbusDevice | null>(null)
  const [registers, setRegisters] = useState<ModbusRegisterForm[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [selectedDeviceModel, setSelectedDeviceModel] = useState<number | null>(null)
  const [preconfiguredRegisters, setPreconfiguredRegisters] = useState<ModbusRegisterForm[]>([])
  const [isLoadingRegisters, setIsLoadingRegisters] = useState(false)

  // KEEP ONLY the device form hook, REMOVE the register form hook
  const { register: registerDevice, handleSubmit: handleDeviceSubmit, formState: { errors: deviceErrors }, reset: resetDevice } = useForm<ModbusDeviceForm>()

  // Load device data when selected
  useEffect(() => {
    if (selectedDevice) {
      resetDevice({
        name: selectedDevice.name,
        address: selectedDevice.address,
        baud_rate: selectedDevice.baud_rate,
        parity: selectedDevice.parity,
        stop_bits: selectedDevice.stop_bits,
        byte_size: selectedDevice.byte_size,
        timeout: selectedDevice.timeout,
        port: selectedDevice.port,
      })
      setRegisters(selectedDevice.registers || [])
    } else {
      resetDevice({
        name: '',
        address: 1,
        baud_rate: 9600,
        parity: 'N',
        stop_bits: 1,
        byte_size: 8,
        timeout: 3,
        port: '/dev/ttyUSB0',
      })
      setRegisters([])
    }
  }, [selectedDevice, resetDevice])

  useEffect(() => {
    if (initialDevice) {
      setSelectedDevice(initialDevice)
    }
  }, [initialDevice])

  useEffect(() => {
    if (selectedDeviceModel) {
      loadPreconfiguredRegisters(selectedDeviceModel)
    } else {
      setPreconfiguredRegisters([])
      // If we switch from device model to custom, keep existing registers
    }
  }, [selectedDeviceModel])

  const loadPreconfiguredRegisters = async (deviceModelId: number) => {
    setIsLoadingRegisters(true)
    try {
      const response = await fetch(`/api/modbus/device-models/${deviceModelId}/registers/`)
      if (response.ok) {
        const data = await response.json()
        // Extract the results array if your API uses the same format
        const registersData = data.results || data
        setPreconfiguredRegisters(registersData)
        // Auto-populate the registers with preconfigured ones
        setRegisters(registersData)
      }
    } catch (error) {
      console.error('Error loading preconfigured registers:', error)
    } finally {
      setIsLoadingRegisters(false)
    }
  }

  const handleRegistersChange = (newRegisters: ModbusRegisterForm[]) => {
    setRegisters(newRegisters)
    
    if (selectedDeviceModel && JSON.stringify(newRegisters) !== JSON.stringify(preconfiguredRegisters)) {
      console.log('User modified preconfigured registers')
      // You could set a state here to show that registers have been customized
    }
  }

  const onDeviceSubmit = async (data: ModbusDeviceForm) => {
    setIsSubmitting(true)
    setSuccessMessage('')

    try {
      const payload = {
        ...data,
        registers: registers.map((reg, index) => ({
          ...reg,
          order: index
        }))
      }

      let result
      if (selectedDevice) {
        result = await updateDevice(selectedDevice.id, payload)
      } else {
        result = await createDevice(payload)
      }

      if (result.success) {
        setSuccessMessage(selectedDevice ? 'Device updated successfully!' : 'Device created successfully!')
        
        // Call success callback if provided
        onConfigSuccess?.()

        // Only reset if we're not in a controlled mode (i.e., not from modbus/config page)
        if (!initialDevice) {
          setSelectedDevice(null)
          setRegisters([])
          resetDevice()
        }

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        throw new Error(result.error || 'Failed to save configuration')
      }
    } catch (error) {
      console.error('Error saving device:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeviceModelSelect = (deviceModelId: number | null) => {
    setSelectedDeviceModel(deviceModelId)
    
    // If selecting a device model, registers will be auto-populated via useEffect
    // If selecting custom (null), keep existing registers or clear if needed
    if (deviceModelId === null) {
      // Optionally clear registers when switching to custom mode
      // setRegisters([])
    }
  }

  const handleApplyConfiguration = async (deviceId: number) => {
    setIsApplying(true)
    setSuccessMessage('')
    
    try {
      const result = await applyConfiguration(deviceId)
      
      if (result.success) {
        setSuccessMessage('Configuration applied to BeagleBone successfully!')
        
        // Poll for status updates if you want real-time feedback
        if (result.data?.log_id) {
          // You can implement polling here
          console.log('Configuration log ID:', result.data.log_id)
        }
        
        setTimeout(() => setSuccessMessage(''), 5000)
      } else {
        throw new Error(result.error || 'Failed to apply configuration')
      }
    } catch (error) {
      console.error('Error applying configuration:', error)
    } finally {
      setIsApplying(false)
    }
  }

  const handleDeleteDevice = async (deviceId: number) => {
    if (!confirm('Are you sure you want to delete this device?')) return

    try {
      const result = await deleteDevice(deviceId)
      
      if (result.success) {
        setSuccessMessage('Device deleted successfully!')
        setSelectedDevice(null)
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        throw new Error(result.error || 'Failed to delete device')
      }
    } catch (error) {
      console.error('Error deleting device:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      )}

      {/* Device List Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Devices</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {devices.map((device) => (
                <div 
                  key={device.id} 
                  className={`p-3 border rounded cursor-pointer transition-colors ${
                    selectedDevice?.id === device.id 
                      ? 'bg-blue-50 border-blue-300' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedDevice(device)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-900">{device.name}</h3>
                      <p className="text-sm text-gray-600">Addr: {device.address}</p>
                      <p className="text-xs text-gray-500">{device.port}</p>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleApplyConfiguration(device.id)
                        }}
                        disabled={isApplying}
                        className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:opacity-50"
                        title="Apply to BeagleBone"
                      >
                        Apply
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteDevice(device.id)
                        }}
                        className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                        title="Delete device"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {devices.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No devices configured
                </div>
              )}
            </div>
            <Button
              onClick={() => {
                setSelectedDevice(null)
                setSuccessMessage('')
              }}
              className="w-full mt-4"
              variant="secondary"
            >
              + New Device
            </Button>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="lg:col-span-3">
          <form onSubmit={handleDeviceSubmit(onDeviceSubmit)} className="bg-white p-6 rounded-lg border space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-700">
                {selectedDevice ? `Edit ${selectedDevice.name}` : 'New Device Configuration'}
              </h2>
              {selectedDevice && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setSelectedDevice(null)
                    setSuccessMessage('')
                  }}
                >
                  Cancel Edit
                </Button>
              )}
            </div>
            
            {/* Device Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Device Name"
                {...registerDevice('name', { required: 'Device name is required' })}
                error={deviceErrors.name?.message}
              />
              
              <Input
                label="Modbus Address"
                type="number"
                {...registerDevice('address', { 
                  required: 'Address is required',
                  min: { value: 1, message: 'Address must be at least 1' },
                  max: { value: 247, message: 'Address must be at most 247' }
                })}
                error={deviceErrors.address?.message}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Serial Port"
                {...registerDevice('port', { required: 'Port is required' })}
                placeholder="/dev/ttyUSB0"
                error={deviceErrors.port?.message}
              />
              
              <Input
                label="Timeout (seconds)"
                type="number"
                {...registerDevice('timeout', { 
                  required: 'Timeout is required',
                  min: { value: 1, message: 'Timeout must be at least 1' }
                })}
                error={deviceErrors.timeout?.message}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Baud Rate</label>
                <select
                  {...registerDevice('baud_rate', { required: 'Baud rate is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={9600}>9600</option>
                  <option value={19200}>19200</option>
                  <option value={38400}>38400</option>
                  <option value={57600}>57600</option>
                  <option value={115200}>115200</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parity</label>
                <select
                  {...registerDevice('parity', { required: 'Parity is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="N">None</option>
                  <option value="E">Even</option>
                  <option value="O">Odd</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stop Bits</label>
                <select
                  {...registerDevice('stop_bits', { required: 'Stop bits are required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Byte Size</label>
                <select
                  {...registerDevice('byte_size', { required: 'Byte size is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={8}>8</option>
                  <option value={7}>7</option>
                </select>
              </div>
            </div>

            {/* Device Model Selection */}
            <DeviceModelSelection
              onDeviceModelSelect={handleDeviceModelSelect}
              selectedDeviceModel={selectedDeviceModel}
              disabled={isSubmitting}
            />

            {/* Register Configuration */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Register Configuration
                {selectedDeviceModel && (
                  <span className="text-sm font-normal text-green-600 ml-2">
                    (Pre-configured for selected device)
                  </span>
                )}
              </h3>

              {isLoadingRegisters ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-gray-600">Loading preconfigured registers...</span>
                </div>
              ) : (
                <RegisterConfiguration
                  registers={registers}
                  onRegistersChange={handleRegistersChange}
                  disabled={isSubmitting}
                  isPreconfigured={!!selectedDeviceModel}
                  preconfiguredRegisters={preconfiguredRegisters}
                />
              )}

              {/* Show message if registers are preconfigured but editable */}
              {selectedDeviceModel && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-700">
                    <strong>Note:</strong> Registers are pre-configured for your selected device model. 
                    You can remove registers but cannot modify existing ones when using a pre-configured device.
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-4 border-t">
              {selectedDevice && (
                <Button
                  type="button"
                  onClick={() => handleApplyConfiguration(selectedDevice.id)}
                  disabled={isApplying}
                  variant="secondary"
                >
                  {isApplying ? 'Applying...' : 'Apply to BeagleBone'}
                </Button>
              )}
              <Button 
                type="submit"
                disabled={isSubmitting || registers.length === 0}
              >
                {isSubmitting ? 'Saving...' : selectedDevice ? 'Update Device' : 'Save Device'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
