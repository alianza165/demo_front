// app/api/env-test/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    grafanaUrl: process.env.GRAFANA_INTERNAL_URL,
    hasToken: !!process.env.GRAFANA_SERVICE_ACCOUNT_TOKEN,
    tokenLength: process.env.GRAFANA_SERVICE_ACCOUNT_TOKEN?.length,
    nodeEnv: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('GRAFANA'))
  })
}
