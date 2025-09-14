// app/components/energy-dashboard/ImprovementRecommendations.tsx
'use client'

interface Recommendation {
  id: string
  area: string
  suggestion: string
  potentialSavings: number
  priority: 'high' | 'medium' | 'low'
}

export default function ImprovementRecommendations() {
  const recommendations: Recommendation[] = [
    { id: '1', area: 'Lighting System', suggestion: 'Replace fluorescent lights with LED fixtures', potentialSavings: 1200, priority: 'high' },
    { id: '2', area: 'HVAC', suggestion: 'Install programmable thermostats and optimize temperature settings', potentialSavings: 850, priority: 'high' },
    { id: '3', area: 'Production Line B', suggestion: 'Schedule energy-intensive processes during off-peak hours', potentialSavings: 650, priority: 'medium' },
    { id: '4', area: 'Compressed Air', suggestion: 'Fix leaks in compressed air system', potentialSavings: 420, priority: 'medium' }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Energy Improvement Recommendations</h2>
      <div className="space-y-4">
        {recommendations.map(rec => (
          <div key={rec.id} className="border-l-4 border-blue-500 pl-4 py-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{rec.area}</h3>
                <p className="text-sm text-gray-600">{rec.suggestion}</p>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                  {rec.priority.toUpperCase()}
                </span>
                <p className="text-sm font-semibold text-green-600 mt-1">Save ${rec.potentialSavings}/year</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
