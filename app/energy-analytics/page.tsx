// app/energy-analytics/page.tsx
'use client'

import ShiftManagement from '../components/energy-dashboard/ShiftManagement'
import ShiftComparisonChart from '../components/energy-dashboard/ShiftComparisonChart'
import AnomalyDetection from '../components/energy-dashboard/AnomalyDetection'
import ImprovementRecommendations from '../components/energy-dashboard/ImprovementRecommendations'

export default function EnergyAnalytics() {
  return (
    <div className="container mx-auto px-4 py-8 text-gray-600">
      <h1 className="text-3xl font-bold mb-6 text-gray-200">Energy Analytics Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ShiftManagement />
        <ShiftComparisonChart />
      </div>
      
      <div className="grid grid-cols-1 gap-6 mb-6">
        <AnomalyDetection />
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <ImprovementRecommendations />
      </div>
    </div>
  )
}
