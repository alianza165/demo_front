// app/api/modbus/devices/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Proxy request to Django backend
    const djangoResponse = await fetch(`${process.env.DJANGO_BACKEND_URL}/api/modbus/devices/`, {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    })

    const data = await djangoResponse.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch devices' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const djangoResponse = await fetch(`${process.env.DJANGO_BACKEND_URL}/api/modbus/devices/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify(body),
    })

    const data = await djangoResponse.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create device' },
      { status: 500 }
    )
  }
}
