import { NextRequest, NextResponse } from 'next/server'

const DJANGO_BACKEND_URL = process.env.DJANGO_BACKEND_URL || 'http://192.168.1.20:8000'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = searchParams.get('days') || '7'
    
    const response = await fetch(
      `${DJANGO_BACKEND_URL}/api/analytics/energy-summaries/compare_devices/?days=${days}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch device comparison data' },
      { status: 500 }
    )
  }
}
