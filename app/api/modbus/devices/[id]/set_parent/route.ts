// app/api/modbus/devices/[id]/set_parent/route.ts
import { NextRequest, NextResponse } from 'next/server'

const DJANGO_BACKEND_URL =
  process.env.DJANGO_BACKEND_URL || process.env.BACKEND_HOST || 'http://127.0.0.1:8000'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const response = await fetch(`${DJANGO_BACKEND_URL}/api/modbus/devices/${id}/set_parent/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Failed to set device parent: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to set device parent' },
      { status: 500 }
    )
  }
}

