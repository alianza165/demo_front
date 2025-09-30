import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const grafanaUrl = process.env.GRAFANA_URL || 'http://localhost:3000'
    const grafanaToken = process.env.GRAFANA_API_TOKEN

    if (!grafanaUrl) {
      return NextResponse.json(
        { error: 'Grafana URL not configured' },
        { status: 500 }
      )
    }

    // Return the Grafana configuration
    const config = {
      url: grafanaUrl,
      token: grafanaToken, // Optional, only if needed for authentication
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching Grafana config:', error)
    return NextResponse.json(
      { error: 'Failed to load Grafana configuration' },
      { status: 500 }
    )
  }
}
