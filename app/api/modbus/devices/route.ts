// app/api/modbus/devices/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getBackendBaseUrl } from '../../backendConfig'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams.toString()
    const backendBase = getBackendBaseUrl()
    const url = `${backendBase}/api/modbus/devices/${searchParams ? `?${searchParams}` : ''}`
    
    console.log('Proxying request to:', url)
    
    // Proxy request to Django backend
    const djangoResponse = await fetch(url, {
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
    
    const backendBase = getBackendBaseUrl()
    console.log('Proxying POST request to:', `${backendBase}/api/modbus/devices/`)
    
    const djangoResponse = await fetch(`${backendBase}/api/modbus/devices/`, {
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
