// app/components/energy-dashboard/ShiftComparisonChart.tsx
'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Morning', consumption: 1250, average: 1100, limit: 1500 },
  { name: 'Evening', consumption: 1650, average: 1550, limit: 1800 },
  { name: 'Night', consumption: 950, average: 900, limit: 1200 }
]

export default function ShiftComparisonChart() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Shift-wise Energy Consumption</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: 'kWh', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="consumption" fill="#8884d8" name="Current Consumption" />
            <Bar dataKey="average" fill="#82ca9d" name="Shift Average" />
            <Bar dataKey="limit" fill="#ffc658" name="Energy Limit" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
