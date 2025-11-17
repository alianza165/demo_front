export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000/api'

export interface EnergyAnalyticsFilters {
  deviceId?: string
  devices?: string[]
  start?: string
  end?: string
  days?: number
  includeHourly?: boolean
  includeTrend?: boolean
  targetKwh?: number
  section?: 'hourly' | 'daily' | 'summary' | 'all'
}

export interface EnergySummaryItem {
  device_id: string
  date: string
  kwh: number | null
  previous_day_kwh: number | null
  difference_kwh: number | null
  pct_change: number | null
}

export interface PerformanceScore {
  consumption_score: number
  power_quality_score: number
  overall_score: number
}

export interface EnergyAnalyticsResponse {
  analysis_window: { start: string; end: string }
  devices: string[]
  daily_summary: EnergySummaryItem[]
  hourly_comparison?: Array<{
    device_id: string
    hour: number
    current_kwh: number | null
    previous_kwh: number | null
    difference_kwh: number | null
    pct_change: number | null
  }>
  trend?: Array<Record<string, unknown>>
  anomalies?: Array<Record<string, unknown>>
  performance_scores: Record<string, PerformanceScore>
  overall_score?: number
}

function buildQuery(filters: EnergyAnalyticsFilters = {}): string {
  const params = new URLSearchParams()

  if (filters.deviceId) params.append('device_id', filters.deviceId)
  if (filters.devices) {
    filters.devices.forEach((device) => params.append('devices', device))
  }
  if (filters.start) params.append('start', filters.start)
  if (filters.end) params.append('end', filters.end)
  if (filters.days !== undefined) params.append('days', String(filters.days))
  if (filters.includeHourly === false) params.append('include_hourly', 'false')
  if (filters.includeTrend === false) params.append('include_trend', 'false')
  if (filters.targetKwh !== undefined)
    params.append('target_kwh', String(filters.targetKwh))
  if (filters.section) params.append('section', filters.section)

  return params.toString()
}

async function fetchJson<T>(
  endpoint: string,
  filters: EnergyAnalyticsFilters = {}
): Promise<T> {
  const query = buildQuery(filters)
  const url = `${API_BASE}${endpoint}${query ? `?${query}` : ''}`

  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })

  if (!res.ok) {
    const detail = await res.text()
    throw new Error(detail || `Request failed with status ${res.status}`)
  }

  return res.json()
}

export const analyticsService = {
  async getEnergySummary(
    filters: EnergyAnalyticsFilters = {}
  ): Promise<EnergyAnalyticsResponse> {
    return fetchJson<EnergyAnalyticsResponse>(
      '/analytics/energy-insights/summary',
      filters
    )
  },

  getReportUrl(filters: EnergyAnalyticsFilters = {}): string {
    const query = buildQuery(filters)
    return `${API_BASE}/analytics/energy-insights/report${query ? `?${query}` : ''}`
  },
}

export default analyticsService