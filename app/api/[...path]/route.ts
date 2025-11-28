import { NextRequest, NextResponse } from 'next/server'
import { getBackendBaseUrl } from '../backendConfig'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params
    const fullPath = path.join('/')
    const searchParams = request.nextUrl.searchParams.toString()
    const backendBase = getBackendBaseUrl()
    const url = `${backendBase}/api/${fullPath}${searchParams ? `?${searchParams}` : ''}`
    
    console.log('Proxying to:', url)
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      // Try to get error message from backend
      let errorMessage = `Backend responded with status: ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.detail || errorData.error || errorMessage
      } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch from backend'
    return NextResponse.json(
      { error: errorMessage },
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
    const backendBase = getBackendBaseUrl()
    const url = `${backendBase}/api/${fullPath}`
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
    const backendBase = getBackendBaseUrl()
    const url = `${backendBase}/api/${fullPath}`
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
    const backendBase = getBackendBaseUrl()
    const url = `${backendBase}/api/${fullPath}`
    
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
