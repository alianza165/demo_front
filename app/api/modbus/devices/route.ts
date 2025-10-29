// app/api/modbus/devices/route.ts
import { NextRequest, NextResponse } from 'next/server'

// Use environment variable with fallback
const DJANGO_BACKEND_URL = process.env.DJANGO_BACKEND_URL || 'http://0.0.0.0:8000'

export async function GET(request: NextRequest) {
  try {
    console.log('Proxying request to:', `${DJANGO_BACKEND_URL}/api/modbus/devices/`)
    
    // Proxy request to Django backend
    const djangoResponse = await fetch(`${DJANGO_BACKEND_URL}/api/modbus/devices/`, {
      headers: {
        'Content-Type': 'application/json',
        // Only pass authorization if present
        ...(request.headers.get('Authorization') && {
          'Authorization': request.headers.get('Authorization')!
        }),
      },
    })

    console.log('Django response status:', djangoResponse.status)

    if (!djangoResponse.ok) {
      const errorText = await djangoResponse.text()
      console.error('Django error response:', errorText)
      throw new Error(`Django backend responded with status: ${djangoResponse.status}`)
    }

    const data = await djangoResponse.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch devices from backend' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('Proxying POST request to:', `${DJANGO_BACKEND_URL}/api/modbus/devices/`)
    
    const djangoResponse = await fetch(`${DJANGO_BACKEND_URL}/api/modbus/devices/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') && {
          'Authorization': request.headers.get('Authorization')!
        }),
      },
      body: JSON.stringify(body),
    })

    console.log('Django POST response status:', djangoResponse.status)

    if (!djangoResponse.ok) {
      const errorText = await djangoResponse.text()
      console.error('Django POST error response:', errorText)
      throw new Error(`Django backend responded with status: ${djangoResponse.status}`)
    }

    const data = await djangoResponse.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Proxy POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create device' },
      { status: 500 }
    )
  }
}
