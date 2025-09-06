// app/components/GrafanaDashboard.tsx
'use client'

import { useState, useEffect } from 'react'

interface GrafanaDashboardProps {
  dashboardUid: string;
  panelId?: string;
  from?: string;
  to?: string;
  theme?: 'light' | 'dark';
  className?: string;
}

export default function GrafanaDashboard({
  dashboardUid,
  panelId,
  from = 'now-6h',
  to = 'now',
  theme = 'light',
  className = ''
}: GrafanaDashboardProps) {
  const [grafanaUrl, setGrafanaUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchGrafanaUrl = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/grafana')
        if (response.ok) {
          const data = await response.json()
          setGrafanaUrl(data.url)
        } else {
          console.error('Failed to fetch Grafana URL')
        }
      } catch (error) {
        console.error('Error fetching Grafana URL:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGrafanaUrl()
  }, [])

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading Grafana dashboard...</p>
        </div>
      </div>
    )
  }

  if (!grafanaUrl) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center text-red-600">
          <p>Failed to load Grafana dashboard</p>
          <p className="text-sm">Please check your Grafana configuration</p>
        </div>
      </div>
    )
  }

  const url = new URL(`${grafanaUrl}/d/${dashboardUid}`)
  url.searchParams.set('from', from)
  url.searchParams.set('to', to)
  url.searchParams.set('theme', theme)
  if (panelId) url.searchParams.set('panelId', panelId)

  return (
    <div className={className}>
      <iframe
        src={url.toString()}
        width="100%"
        height="100%"
        frameBorder="0"
        className="min-h-[600px] w-full rounded-lg border"
        title="Grafana Dashboard"
        loading="lazy"
      />
    </div>
  )
}
