// app/api/modbus/realtime/power/route.ts
import { NextRequest, NextResponse } from 'next/server'

const DJANGO_BACKEND_URL =
  process.env.DJANGO_BACKEND_URL || process.env.BACKEND_HOST || 'http://127.0.0.1:8000'

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${DJANGO_BACKEND_URL}/api/modbus/realtime/power/`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Django backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch real-time power data from backend' },
      { status: 500 }
    )
  }
}




