'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import type { SubDepartmentBreakdown } from '../../api/energy-analytics'

interface SubDepartmentChartProps {
  data: SubDepartmentBreakdown[]
}

const COLORS = {
  'Machine': '#3b82f6',
  'Lights': '#fbbf24',
  'HVAC': '#10b981',
  'Exhaust': '#ef4444',
  'Offices': '#8b5cf6',
  'UPS': '#ec4899',
  'Misc': '#6b7280',
  'Other': '#9ca3af',
}

const getColorForSubDept = (subDept: string): string => {
  return COLORS[subDept as keyof typeof COLORS] || COLORS.Other
}

export default function SubDepartmentChart({ data }: SubDepartmentChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No sub-department data available
      </div>
    )
  }

  // Transform data for grouped bar chart
  const chartData: Array<{
    sub_department: string
    [key: string]: string | number
  }> = []

  // Get all unique sub-departments across all process areas
  const allSubDepts = new Set<string>()
  data.forEach(area => {
    area.sub_departments.forEach(sub => {
      allSubDepts.add(sub.sub_department)
    })
  })

  // Create data structure for grouped bars
  allSubDepts.forEach(subDept => {
    const entry: any = { sub_department: subDept }
    data.forEach(area => {
      const subDeptData = area.sub_departments.find(s => s.sub_department === subDept)
      entry[area.process_area] = subDeptData ? subDeptData.total_energy : 0
    })
    chartData.push(entry)
  })

  // Sort by total energy (sum across all areas)
  chartData.sort((a, b) => {
    const totalA = data.reduce((sum, area) => {
      const val = a[area.process_area]
      return sum + (typeof val === 'number' ? val : 0)
    }, 0)
    const totalB = data.reduce((sum, area) => {
      const val = b[area.process_area]
      return sum + (typeof val === 'number' ? val : 0)
    }, 0)
    return totalB - totalA
  })

  // Get unique process areas for bars
  const processAreas = data.map(d => d.process_area)

  return (
    <div className="space-y-6">
      {data.map((areaData) => (
        <div key={areaData.process_area} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {areaData.process_area.charAt(0).toUpperCase() + areaData.process_area.slice(1)} Department
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Total: {areaData.total_energy.toFixed(2)} kWh
          </p>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={areaData.sub_departments} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
              <XAxis
                dataKey="sub_department"
                className="text-gray-700 dark:text-gray-300"
                tick={{ fill: 'currentColor', fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                className="text-gray-700 dark:text-gray-300"
                tick={{ fill: 'currentColor' }}
                label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                }}
                formatter={(value: number, name: string, props: any) => {
                  const percentage = props.payload.percentage || 0
                  return [
                    `${value.toFixed(2)} kWh (${percentage.toFixed(1)}%)`,
                    'Energy'
                  ]
                }}
              />
              <Legend />
              <Bar dataKey="total_energy" name="Energy (kWh)" radius={[8, 8, 0, 0]}>
                {areaData.sub_departments.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getColorForSubDept(entry.sub_department)} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Sub-department breakdown table */}
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sub-Department
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Energy (kWh)
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Devices
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {areaData.sub_departments.map((sub, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: getColorForSubDept(sub.sub_department) }}
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {sub.sub_department}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                      {sub.total_energy.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                      {sub.percentage.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                      {sub.device_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
