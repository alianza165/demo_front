// app/api/modbus/devices/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getBackendBaseUrl } from '../../../backendConfig'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // params is now a Promise
) {
  try {
    const { id } = await params // Await the params
    const backendBase = getBackendBaseUrl()
    const response = await fetch(`${backendBase}/api/modbus/devices/${id}/`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
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
      { error: 'Failed to fetch device from backend' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // params is now a Promise
) {
  try {
    const { id } = await params // Await the params
    const backendBase = getBackendBaseUrl()
    const body = await request.json()
    
    const response = await fetch(`${backendBase}/api/modbus/devices/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Django backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to update device' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // params is now a Promise
) {
  try {
    const { id } = await params // Await the params
    const backendBase = getBackendBaseUrl()
    const response = await fetch(`${backendBase}/api/modbus/devices/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    })

    if (!response.ok) {
      throw new Error(`Django backend responded with status: ${response.status}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to delete device from backend' },
      { status: 500 }
    )
  }
}
