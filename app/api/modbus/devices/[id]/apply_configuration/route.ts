// app/api/modbus/devices/[id]/apply_configuration/route.ts
import { NextRequest, NextResponse } from 'next/server'

const DJANGO_BACKEND_URL = process.env.DJANGO_BACKEND_URL || 'http://192.168.1.20:8000'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Applying configuration for device:', params.id)
    
    const response = await fetch(
      `${DJANGO_BACKEND_URL}/api/modbus/devices/${params.id}/apply_configuration/`, 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    console.log('Apply configuration response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Apply configuration error:', errorText)
      throw new Error(`Django backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    console.log('Apply configuration success:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Proxy error for apply configuration:', error)
    return NextResponse.json(
      { error: 'Failed to apply configuration to backend' },
      { status: 500 }
    )
  }
}
