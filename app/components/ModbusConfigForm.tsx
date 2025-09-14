// app/components/ModbusConfigForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Button from './ui/Button'
import Input from './ui/Input'

interface ModbusDevice {
  id: number
  name: string
  address: number
  baud_rate: number
  parity: string
  stop_bits: number
  byte_size: number
  registers: ModbusRegister[]
}

interface ModbusRegister {
  id: number
  address: number
  name: string
  data_type: string
  scale_factor: number
  unit: string
}

interface ModbusDeviceForm {
  name: string
  address: number
  baud_rate: number
  parity: string
  stop_bits: number
  byte_size: number
}

interface ModbusRegisterForm {
  address: number
  name: string
  data_type: string
  scale_factor: number
  unit: string
}

export default function ModbusConfigForm() {
  const [devices, setDevices] = useState<ModbusDevice[]>([])
  const [selectedDevice, setSelectedDevice] = useState<ModbusDevice | null>(null)
  const [registers, setRegisters] = useState<ModbusRegisterForm[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isApplying, setIsApplying] = useState(false)

  const { register: registerDevice, handleSubmit: handleDeviceSubmit, formState: { errors: deviceErrors }, reset: resetDevice } = useForm<ModbusDeviceForm>()
  const { register: registerRegister, handleSubmit: handleRegisterSubmit, reset: resetRegister, formState: { errors: registerErrors } } = useForm<ModbusRegisterForm>()

  // Fetch existing devices
  useEffect(() => {
    fetchDevices()
  }, [])

  // Load device data when selected
  useEffect(() => {
    if (selectedDevice) {
      resetDevice({
        name: selectedDevice.name,
        address: selectedDevice.address,
        baud_rate: selectedDevice.baud_rate,
        parity: selectedDevice.parity,
        stop_bits: selectedDevice.stop_bits,
        byte_size: selectedDevice.byte_size
      })
      setRegisters(selectedDevice.registers || [])
    } else {
      resetDevice()
      setRegisters([])
    }
  }, [selectedDevice, resetDevice])

  const fetchDevices = async () => {
    try {
      const response = await fetch('http://your-django-backend/api/modbus/devices/')
      if (response.ok) {
        const data = await response.json()
        setDevices(data)
      }
    } catch (error) {
      console.error('Error fetching devices:', error)
    }
  }

  const onDeviceSubmit = async (data: ModbusDeviceForm) => {
    setIsSubmitting(true)
    try {
      const payload = {
        ...data,
        registers
      }

      const url = selectedDevice 
        ? `http://your-django-backend/api/modbus/devices/${selectedDevice.id}/`
        : 'http://your-django-backend/api/modbus/devices/'

      const method = selectedDevice ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        alert(selectedDevice ? 'Device updated successfully!' : 'Device created successfully!')
        setSelectedDevice(null)
        setRegisters([])
        resetDevice()
        fetchDevices()
      } else {
        throw new Error('Failed to save configuration')
      }
    } catch (error) {
      console.error('Error saving device:', error)
      alert('Error saving configuration. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const onRegisterSubmit = (data: ModbusRegisterForm) => {
    setRegisters(prev => [...prev, data])
    resetRegister()
  }

  const removeRegister = (index: number) => {
    setRegisters(prev => prev.filter((_, i) => i !== index))
  }

  const applyConfiguration = async (deviceId: number) => {
    setIsApplying(true)
    try {
      const response = await fetch(
        `http://your-django-backend/api/modbus/devices/${deviceId}/apply_configuration/`,
        { method: 'POST' }
      )

      if (response.ok) {
        const result = await response.json()
        alert('Configuration applied to BeagleBone successfully!')
        
        // Poll for status updates if you want real-time feedback
        if (result.log_id) {
          checkApplicationStatus(result.log_id)
        }
      } else {
        throw new Error('Failed to apply configuration')
      }
    } catch (error) {
      console.error('Error applying configuration:', error)
      alert('Error applying configuration. Please try again.')
    } finally {
      setIsApplying(false)
    }
  }

  const checkApplicationStatus = async (logId: number) => {
    // Optional: Implement polling to check status
    try {
      const response = await fetch(
        `http://your-django-backend/api/modbus/config-logs/${logId}/`
      )
      if (response.ok) {
        const log = await response.json()
        console.log('Application status:', log.status)
        // You could update UI based on status here
      }
    } catch (error) {
      console.error('Error checking status:', error)
    }
  }

  const deleteDevice = async (deviceId: number) => {
    if (!confirm('Are you sure you want to delete this device?')) return

    try {
      const response = await fetch(
        `http://your-django-backend/api/modbus/devices/${deviceId}/`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        alert('Device deleted successfully!')
        setSelectedDevice(null)
        fetchDevices()
      }
    } catch (error) {
      console.error('Error deleting device:', error)
      alert('Error deleting device. Please try again.')
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Device List Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Devices</h2>
            <div className="space-y-2">
              {devices.map((device) => (
                <div key={device.id} className="p-3 border rounded hover:bg-gray-50 cursor-pointer">
                  <div 
                    className={`flex justify-between items-center ${
                      selectedDevice?.id === device.id ? 'text-blue-600' : ''
                    }`}
                    onClick={() => setSelectedDevice(device)}
                  >
                    <div>
                      <h3 className="font-medium">{device.name}</h3>
                      <p className="text-sm text-gray-600">Addr: {device.address}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          applyConfiguration(device.id)
                        }}
                        disabled={isApplying}
                        className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:opacity-50"
                      >
                        Apply
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteDevice(device.id)
                        }}
                        className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={() => setSelectedDevice(null)}
              className="w-full mt-4"
              variant="secondary"
            >
              + New Device
            </Button>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="lg:col-span-3">
          <form onSubmit={handleDeviceSubmit(onDeviceSubmit)} className="bg-white p-6 rounded-lg border space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {selectedDevice ? `Edit ${selectedDevice.name}` : 'New Device Configuration'}
              </h2>
              {selectedDevice && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setSelectedDevice(null)}
                >
                  Cancel Edit
                </Button>
              )}
            </div>
            
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

            {/* Register Configuration */}
            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-4">Register Configuration</h3>
              
              <form onSubmit={handleRegisterSubmit(onRegisterSubmit)} className="space-y-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Input
                    label="Register Address"
                    type="number"
                    {...registerRegister('address', { required: 'Address is required' })}
                    error={registerErrors.address?.message}
                  />
                  
                  <Input
                    label="Register Name"
                    {...registerRegister('name', { required: 'Name is required' })}
                    error={registerErrors.name?.message}
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Type</label>
                    <select
                      {...registerRegister('data_type', { required: 'Data type is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="uint16">Unsigned 16-bit</option>
                      <option value="int16">Signed 16-bit</option>
                      <option value="uint32">Unsigned 32-bit</option>
                      <option value="int32">Signed 32-bit</option>
                      <option value="float32">Float 32-bit</option>
                    </select>
                  </div>
                  
                  <Input
                    label="Scale Factor"
                    type="number"
                    step="0.001"
                    defaultValue={1}
                    {...registerRegister('scale_factor')}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Unit"
                    {...registerRegister('unit')}
                    placeholder="e.g., kWh, kW, V"
                  />
                  
                  <div className="flex items-end">
                    <Button type="submit" className="w-full">
                      Add Register
                    </Button>
                  </div>
                </div>
              </form>

              {/* Registered Registers List */}
              {registers.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-3">Configured Registers</h4>
                  <div className="space-y-2">
                    {registers.map((register, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium">{register.name}</span>
                          <span className="text-sm text-gray-600 ml-2">
                            (0x{register.address.toString(16).toUpperCase()}, {register.data_type})
                          </span>
                          {register.unit && (
                            <span className="text-sm text-gray-600 ml-2">[{register.unit}]</span>
                          )}
                        </div>
                        <button
                          onClick={() => removeRegister(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              {selectedDevice && (
                <Button
                  type="button"
                  onClick={() => applyConfiguration(selectedDevice.id)}
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
