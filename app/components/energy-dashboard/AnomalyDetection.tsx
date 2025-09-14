// app/components/energy-dashboard/AnomalyDetection.tsx
'use client'

interface Anomaly {
  id: string
  area: string
  timestamp: string
  value: number
  expected: number
  deviation: number
}

export default function AnomalyDetection() {
  const anomalies: Anomaly[] = [
    { id: '1', area: 'Production Line A', timestamp: '2025-09-14 10:23', value: 245, expected: 180, deviation: 36 },
    { id: '2', area: 'Compressor Room', timestamp: '2025-09-14 15:47', value: 87, expected: 65, deviation: 34 },
    { id: '3', area: 'Lighting - Main Hall', timestamp: '2025-09-14 20:15', value: 42, expected: 30, deviation: 40 }
  ]

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Recent Energy Anomalies</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consumption</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deviation</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {anomalies.map(anomaly => (
              <tr key={anomaly.id} className={anomaly.deviation > 30 ? 'bg-red-50' : 'bg-yellow-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{anomaly.area}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{anomaly.timestamp}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{anomaly.value} kWh</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <span className={anomaly.deviation > 30 ? 'text-red-600' : 'text-yellow-600'}>
                    +{anomaly.deviation}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
