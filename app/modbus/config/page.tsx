// app/modbus/config/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import ModbusConfigForm from '../../components/ModbusConfigForm'

interface ModbusDevice {
  id: number
  name: string
  address: number
  baud_rate: number
  parity: string
  stop_bits: number
  byte_size: number
  registers: any[]
}

export default function ModbusConfigPage() {
  const searchParams = useSearchParams()
  const deviceId = searchParams.get('id')
  const [device, setDevice] = useState<ModbusDevice | null>(null)
  const [isLoading, setIsLoading] = useState(!!deviceId)

  useEffect(() => {
    if (deviceId) {
      fetchDevice(parseInt(deviceId))
    }
  }, [deviceId])

  const fetchDevice = async (id: number) => {
    try {
      const response = await fetch(`http://your-django-backend/api/modbus/devices/${id}/`)
      if (response.ok) {
        const data = await response.json()
        setDevice(data)
      }
    } catch (error) {
      console.error('Error fetching device:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-3xl font-bold">
          {device ? `Edit ${device.name}` : 'Add New Modbus Device'}
        </h1>
        {device && (
          <span className={`px-3 py-1 rounded-full text-sm ${
            device ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {device ? 'Active' : 'Inactive'}
          </span>
        )}
      </div>

      <ModbusConfigForm />
    </div>
  )
}
