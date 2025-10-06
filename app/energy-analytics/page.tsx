'use client'

import { useState } from 'react'
import DeviceComparison from '../components/analytics/DeviceComparison'
import ShiftAnalysis from '../components/analytics/ShiftAnalysis'

type AnalyticsTab = 'devices' | 'shifts' | 'trends' | 'costs'

export default function EnergyAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('devices')
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d')

  const tabs = [
    { id: 'devices' as AnalyticsTab, name: 'Device Comparison', icon: '📊' },
    { id: 'shifts' as AnalyticsTab, name: 'Shift Analysis', icon: '🕐' },
    { id: 'trends' as AnalyticsTab, name: 'Energy Trends', icon: '📈' },
    { id: 'costs' as AnalyticsTab, name: 'Cost Analysis', icon: '💰' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Energy Analytics</h1>
          <p className="text-gray-600 mt-1">
            Advanced analysis of energy consumption patterns and costs
          </p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Time Range:</span>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'devices' && <DeviceComparison timeRange={timeRange} />}
        {activeTab === 'shifts' && <ShiftAnalysis timeRange={timeRange} />}
      </div>

      {/* Data Source Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-blue-800 font-medium">Analytics Data Source</p>
            <p className="text-blue-700 text-sm mt-1">
              Data is aggregated from real-time measurements and stored for historical analysis.
              Updates occur hourly for energy summaries and daily for shift calculations.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
