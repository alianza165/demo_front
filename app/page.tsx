// app/page.tsx
import Link from 'next/link'

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
          Industrial Energy Monitoring
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Real-time energy consumption tracking and analytics for industrial facilities
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Link 
          href="/dashboard" 
          className="group p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
              <span className="text-2xl">📊</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Live Dashboard
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                View real-time energy consumption data, power quality metrics, and interactive analytics
              </p>
            </div>
            <div className="text-blue-500 group-hover:text-blue-600 dark:text-blue-400 dark:group-hover:text-blue-300 transition-colors">
              →
            </div>
          </div>
        </Link>

        <Link 
          href="/modbus" 
          className="group p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
              <span className="text-2xl">⚙️</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Device Configuration
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Configure Modbus devices, register settings, and manage energy meter connections
              </p>
            </div>
            <div className="text-green-500 group-hover:text-green-600 dark:text-green-400 dark:group-hover:text-green-300 transition-colors">
              →
            </div>
          </div>
        </Link>
      </div>

      {/* System Status */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 border border-blue-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
            System Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 text-center shadow-sm">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 dark:text-green-400">✓</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Grafana</h3>
              <p className="text-green-600 dark:text-green-400 text-sm">Connected</p>
            </div>
            
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 text-center shadow-sm">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 dark:text-green-400">✓</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">InfluxDB</h3>
              <p className="text-green-600 dark:text-green-400 text-sm">Connected</p>
            </div>
            
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 text-center shadow-sm">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 dark:text-green-400">✓</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">BeagleBone</h3>
              <p className="text-green-600 dark:text-green-400 text-sm">Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">At a Glance</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">15+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Parameters</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">24/7</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Monitoring</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">30+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Devices Supported</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">99.9%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
