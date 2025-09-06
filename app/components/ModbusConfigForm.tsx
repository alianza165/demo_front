// app/components/ModbusConfigForm.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Button from './ui/Button'
import Input from './ui/Input'

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
  const [registers, setRegisters] = useState<ModbusRegisterForm[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register: registerDevice, handleSubmit: handleDeviceSubmit, formState: { errors: deviceErrors } } = useForm<ModbusDeviceForm>()
  const { register: registerRegister, handleSubmit: handleRegisterSubmit, reset: resetRegister, formState: { errors: registerErrors } } = useForm<ModbusRegisterForm>()

  const onDeviceSubmit = async (data: ModbusDeviceForm) => {
    setIsSubmitting(true)
    try {
      const payload = {
        ...data,
        registers
      }

      // This will call your Django backend
      const response = await fetch('http://your-django-backend/api/modbus/devices/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        alert('Device configuration saved successfully!')
        setRegisters([])
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Device Configuration */}
      <form onSubmit={handleDeviceSubmit(onDeviceSubmit)} className="bg-white p-6 rounded-lg border space-y-4">
        <h2 className="text-xl font-semibold">Device Configuration</h2>
        
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
      </form>

      {/* Register Configuration */}
      <div className="bg-white p-6 rounded-lg border space-y-4">
        <h2 className="text-xl font-semibold">Register Configuration</h2>
        
        <form onSubmit={handleRegisterSubmit(onRegisterSubmit)} className="space-y-4">
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
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Configured Registers</h3>
            <div className="space-y-2">
              {registers.map((register, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{register.name}</span>
                    <span className="text-sm text-gray-600 ml-2">
                      (0x{register.address.toString(16).toUpperCase()}, {register.data_type})
                    </span>
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
      <div className="flex justify-end">
        <Button 
          type="submit" 
          onClick={handleDeviceSubmit(onDeviceSubmit)}
          disabled={isSubmitting || registers.length === 0}
        >
          {isSubmitting ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>
    </div>
  )
}
