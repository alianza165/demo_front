// app/api/grafana/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  // In production, you might want to fetch this from environment variables
  // or your Django backend
  const grafanaUrl = process.env.GRAFANA_URL || 'http://localhost:3001'
  
  return NextResponse.json({ 
    url: grafanaUrl,
    status: 'connected'
  })
}
