// app/api/grafana/config/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  // For server-side, use internal URL; for client-side info, use public URL
  const config = {
    serverUrl: process.env.GRAFANA_INTERNAL_URL, // For server-side API calls
    clientUrl: process.env.NEXT_PUBLIC_GRAFANA_URL, // For client-side iframe
    status: 'connected',
    timestamp: new Date().toISOString()
  }

  if (!config.serverUrl || !config.clientUrl) {
    return NextResponse.json(
      { error: 'Grafana URL not configured' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    url: config.clientUrl, // Return the public URL for the client
    status: config.status,
    timestamp: config.timestamp
  })
}
