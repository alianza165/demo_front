// app/modbus/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ModbusDevice {
  id: number
  name: string
  address: number
  baud_rate: number
  is_active: boolean
}

export default function ModbusPage() {
  const [devices, setDevices] = useState<ModbusDevice[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDevices()
  }, [])

  const fetchDevices = async () => {
    try {
      setIsLoading(true)
      // This will call your Django backend API
      const response = await fetch('http://your-django-backend/api/modbus/devices/')
      if (response.ok) {
        const data = await response.json()
        setDevices(data)
      }
    } catch (error) {
      console.error('Error fetching devices:', error)
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Modbus Devices</h1>
        <Link 
          href="/modbus/config"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add New Device
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map((device) => (
          <div key={device.id} className="p-4 bg-white border rounded-lg">
            <h3 className="font-semibold text-lg">{device.name}</h3>
            <p className="text-gray-600">Address: {device.address}</p>
            <p className="text-gray-600">Baud Rate: {device.baud_rate}</p>
            <div className="flex items-center mt-2">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                device.is_active ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span>{device.is_active ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="mt-4 space-x-2">
              <Link 
                href={`/modbus/config?id=${device.id}`}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded"
              >
                Edit
              </Link>
              <button className="px-3 py-1 bg-green-500 text-white text-sm rounded">
                Apply Config
              </button>
            </div>
          </div>
        ))}
      </div>

      {devices.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No Modbus devices configured yet.</p>
          <Link 
            href="/modbus/config"
            className="text-blue-500 hover:underline mt-2 inline-block"
          >
            Add your first device
          </Link>
        </div>
      )}
    </div>
  )
}
