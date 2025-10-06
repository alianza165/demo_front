import { NextRequest, NextResponse } from 'next/server'

const DJANGO_BACKEND_URL = process.env.DJANGO_BACKEND_URL || 'http://192.168.1.20:8000'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params
    const fullPath = path.join('/')
    const searchParams = request.nextUrl.searchParams.toString()
    const url = `${DJANGO_BACKEND_URL}/api/${fullPath}${searchParams ? `?${searchParams}` : ''}`
    
    console.log('Proxying to:', url)
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch from backend' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params
    const fullPath = path.join('/')
    const url = `${DJANGO_BACKEND_URL}/api/${fullPath}`
    const body = await request.json()
    
    console.log('Proxying POST to:', url)
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to post to backend' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params
    const fullPath = path.join('/')
    const url = `${DJANGO_BACKEND_URL}/api/${fullPath}`
    const body = await request.json()
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to update on backend' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params
    const fullPath = path.join('/')
    const url = `${DJANGO_BACKEND_URL}/api/${fullPath}`
    
    const response = await fetch(url, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to delete from backend' },
      { status: 500 }
    )
  }
}
