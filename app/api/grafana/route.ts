// app/api/grafana/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const isProduction = process.env.NODE_ENV === 'production'
  
  // Use internal URL for server-side, public URL for client-side
  const grafanaUrl = isProduction 
    ? process.env.GRAFANA_INTERNAL_URL 
    : process.env.NEXT_PUBLIC_GRAFANA_URL

  if (!grafanaUrl) {
    return NextResponse.json(
      { error: 'Grafana URL not configured' },
      { status: 500 }
    )
  }

  return NextResponse.json({ 
    url: grafanaUrl,
    status: 'connected',
    environment: process.env.NODE_ENV
  })
}
