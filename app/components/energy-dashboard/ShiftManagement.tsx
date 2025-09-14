// app/components/energy-dashboard/ShiftManagement.tsx
'use client'

import { useState } from 'react'

interface Shift {
  id: string
  name: string
  startTime: string
  endTime: string
  energyLimit: number
}

export default function ShiftManagement() {
  const [shifts, setShifts] = useState<Shift[]>([
    { id: '1', name: 'Morning Shift', startTime: '06:00', endTime: '14:00', energyLimit: 1500 },
    { id: '2', name: 'Evening Shift', startTime: '14:00', endTime: '22:00', energyLimit: 1800 },
    { id: '3', name: 'Night Shift', startTime: '22:00', endTime: '06:00', energyLimit: 1200 }
  ])

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Shift Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {shifts.map(shift => (
          <div key={shift.id} className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">{shift.name}</h3>
            <p className="text-sm text-gray-600">
              Time: {shift.startTime} - {shift.endTime}
            </p>
            <p className="text-sm text-gray-600">
              Energy Limit: {shift.energyLimit} kWh
            </p>
            <div className="mt-3 bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${Math.min(100, (1250 / shift.energyLimit) * 100)}%` }}
              ></div>
            </div>
            <p className="text-xs mt-1">1250 / {shift.energyLimit} kWh (83%)</p>
          </div>
        ))}
      </div>
    </div>
  )
}
