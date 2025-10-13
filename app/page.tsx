// app/page.tsx
import Link from 'next/link'

export default function Home() {
  return (
    <div className="space-y-8 px-2 sm:px-0">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
          Industrial Energy Monitoring
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
          Real-time energy consumption tracking and analytics for industrial facilities
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
        <Link 
          href="/dashboard" 
          className="group p-4 sm:p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          <div className="flex items-start space-x-3 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors flex-shrink-0">
              <span className="text-xl sm:text-2xl">📊</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Live Dashboard
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                View real-time energy consumption data, power quality metrics, and interactive analytics
              </p>
            </div>
            <div className="text-blue-500 group-hover:text-blue-600 dark:text-blue-400 dark:group-hover:text-blue-300 transition-colors flex-shrink-0">
              →
            </div>
          </div>
        </Link>

        <Link 
          href="/modbus" 
          className="group p-4 sm:p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          <div className="flex items-start space-x-3 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors flex-shrink-0">
              <span className="text-xl sm:text-2xl">⚙️</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Device Configuration
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                Configure Modbus devices, register settings, and manage energy meter connections
              </p>
            </div>
            <div className="text-green-500 group-hover:text-green-600 dark:text-green-400 dark:group-hover:text-green-300 transition-colors flex-shrink-0">
              →
            </div>
          </div>
        </Link>
      </div>

      {/* System Status */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 border border-blue-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6 text-center">
            System Status
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-gray-700 rounded-lg p-3 sm:p-4 text-center shadow-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <span className="text-green-600 dark:text-green-400 text-sm sm:text-base">✓</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Grafana</h3>
              <p className="text-green-600 dark:text-green-400 text-xs sm:text-sm">Connected</p>
            </div>
            
            <div className="bg-white dark:bg-gray-700 rounded-lg p-3 sm:p-4 text-center shadow-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <span className="text-green-600 dark:text-green-400 text-sm sm:text-base">✓</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">InfluxDB</h3>
              <p className="text-green-600 dark:text-green-400 text-xs sm:text-sm">Connected</p>
            </div>
            
            <div className="bg-white dark:bg-gray-700 rounded-lg p-3 sm:p-4 text-center shadow-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <span className="text-green-600 dark:text-green-400 text-sm sm:text-base">✓</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">BeagleBone</h3>
              <p className="text-green-600 dark:text-green-400 text-xs sm:text-sm">Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-center sm:text-left">
            At a Glance
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">15+</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Parameters</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">24/7</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Monitoring</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">30+</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Devices Supported</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">99.9%</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info Section */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-center">
            Why Choose Our System?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-center">
            <div className="p-3 sm:p-4">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-yellow-600 dark:text-yellow-400">💰</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base mb-1">Cost Savings</h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Identify energy waste and reduce costs</p>
            </div>
            <div className="p-3 sm:p-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-red-600 dark:text-red-400">📈</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base mb-1">Real-time Data</h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Live monitoring with instant alerts</p>
            </div>
            <div className="p-3 sm:p-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 dark:text-blue-400">🔧</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base mb-1">Easy Integration</h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Works with existing equipment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
