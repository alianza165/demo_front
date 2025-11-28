// app/api/modbus/realtime/power/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getBackendBaseUrl } from '../../../backendConfig'

export async function GET(request: NextRequest) {
  try {
    const backendBase = getBackendBaseUrl()
    const response = await fetch(`${backendBase}/api/modbus/realtime/power/`, {
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




