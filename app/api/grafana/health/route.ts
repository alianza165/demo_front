// app/api/grafana/health/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const grafanaUrl = process.env.GRAFANA_INTERNAL_URL || 'http://localhost:3001'
  const token = process.env.GRAFANA_SERVICE_ACCOUNT_TOKEN

  console.log('Grafana URL:', grafanaUrl)
  console.log('Token present:', !!token)
  console.log('Token length:', token?.length)

  if (!token) {
    return NextResponse.json(
      { error: 'Grafana Service Account token not configured. Check your .env.local file' },
      { status: 500 }
    )
  }

  try {
    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(`${grafanaUrl}/api/health`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      signal: controller.signal, // Use signal for abort/timeout
    })

    // Clear the timeout since the request completed
    clearTimeout(timeoutId)

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({
        status: 'healthy',
        grafana: data,
        authenticated: true
      })
    } else {
      const errorText = await response.text()
      console.error('Grafana API error:', response.status, errorText)
      return NextResponse.json({
        status: 'error',
        message: `Grafana responded with ${response.status}`,
        authenticated: false,
        error: errorText
      }, { status: response.status })
    }
  } catch (error) {
    console.error('Connection error:', error)
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({
        status: 'error',
        message: 'Connection to Grafana timed out',
        error: 'Timeout after 5000ms'
      }, { status: 504 })
    }

    return NextResponse.json({
      status: 'error',
      message: 'Failed to connect to Grafana',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 })
  }
}
