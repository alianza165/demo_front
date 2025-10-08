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
  theme = 'auto', // auto, light, or dark
  className = ''
}: GrafanaDashboardProps) {
  const [grafanaConfig, setGrafanaConfig] = useState<{url: string; token?: string} | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Simple and reliable theme detection
  const getCurrentTheme = () => {
    console.log("testttt")
    if (theme === 'light' || theme === 'dark') {
      console.log(theme)
      return theme
    }
    // Check if dark mode is active on the document
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  }

  const currentTheme = getCurrentTheme()

  useEffect(() => {
    console.log("testttt")
    getCurrentTheme()
    const fetchGrafanaConfig = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch('/api/grafana/config')
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch Grafana config')
        }
        
        const data = await response.json()
        
        if (!data.url) {
          throw new Error('Grafana URL not configured')
        }
        
        setGrafanaConfig(data)
      } catch (error) {
        console.error('Error fetching Grafana config:', error)
        setError(error instanceof Error ? error.message : 'Failed to load Grafana configuration')
      } finally {
        setIsLoading(false)
      }
    }

    fetchGrafanaConfig()
  }, [])

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading Grafana dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !grafanaConfig) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center text-red-600 dark:text-red-400 max-w-md">
          <svg className="w-12 h-12 mx-auto mb-3 text-red-400 dark:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="font-medium">Dashboard Unavailable</p>
          <p className="text-sm mt-1">{error || 'Grafana configuration missing'}</p>
          <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
            <p>Please check your Grafana configuration:</p>
            <ul className="mt-1 space-y-1">
              <li>• Grafana server is running</li>
              <li>• GRAFANA_URL is set in environment variables</li>
              <li>• Dashboard UID is correct: {dashboardUid}</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  try {
    const url = new URL(`${grafanaConfig.url}/d/${dashboardUid}`)
    url.searchParams.set('from', from)
    url.searchParams.set('to', to)
    url.searchParams.set('theme', currentTheme) // Use the detected theme
    url.searchParams.set('kiosk', '1')
    if (panelId) url.searchParams.set('panelId', panelId)
    
    // Replace localhost with your server's IP if needed
    const publicUrl = grafanaConfig.url.replace('localhost', window.location.hostname)
    const finalUrl = url.toString().replace(grafanaConfig.url, publicUrl)

    return (
      <div className={className}>
        <iframe
          src={finalUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          className="min-h-[600px] w-full rounded-lg border border-gray-200 dark:border-gray-700"
          title={`Grafana Dashboard: ${dashboardUid}`}
          loading="lazy"
          referrerPolicy="same-origin"
        />
      </div>
    )
  } catch (urlError) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center text-red-600 dark:text-red-400">
          <p>Invalid Grafana URL configuration</p>
          <p className="text-sm mt-1">Please check your GRAFANA_URL environment variable</p>
        </div>
      </div>
    )
  }
}
