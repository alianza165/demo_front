// app/page.tsx
import Link from 'next/link'

export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Energy Monitoring System</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard" className="p-6 border rounded-lg hover:bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">📊 Live Dashboard</h2>
          <p>View real-time energy consumption data and analytics</p>
        </Link>

        <Link href="/modbus" className="p-6 border rounded-lg hover:bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">⚙️ Modbus Configuration</h2>
          <p>Configure Modbus devices and register settings</p>
        </Link>
      </div>

      <div className="bg-gray-100 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">System Status</h2>
        <div className="space-y-2">
          <p>✅ Grafana Dashboard: Connected</p>
          <p>✅ InfluxDB: Connected</p>
          <p>✅ BeagleBone: Online</p>
        </div>
      </div>
    </div>
  )
}
