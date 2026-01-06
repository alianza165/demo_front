/**
 * API service for energy analytics and visualizations
 */

// Use Next.js API proxy route instead of calling backend directly
// This avoids CORS issues and handles routing correctly
const getApiBase = () => {
  // In browser/client-side, use relative path to Next.js API proxy
  if (typeof window !== 'undefined') {
    return '/api'
  }
  
  // In server-side (SSR), use backend URL directly
  // Check for environment variable first
  if (process.env.NEXT_PUBLIC_API_URL) {
    const url = process.env.NEXT_PUBLIC_API_URL.trim()
    return url.endsWith('/api') ? url : `${url}/api`
  }
  
  // Fallback: use backend config for server-side
  const { getBackendBaseUrl } = require('./backendConfig')
  const backendUrl = getBackendBaseUrl()
  return `${backendUrl}/api`
}

// Use a function to get API base instead of a constant
// This ensures it's evaluated at runtime, not module load time
const API_BASE = () => getApiBase()

export interface EnergySummary {
  id: number
  device: number
  device_name: string
  timestamp: string
  interval_type: 'hourly' | 'daily' | 'monthly'
  total_energy_kwh: number
  avg_power_kw: number
  max_power_kw: number
  min_power_kw: number
  energy_cost: number | null
  tariff_rate: number
}

export interface DashboardStats {
  total_energy_kwh: number
  avg_daily_energy_kwh: number
  peak_daily_energy_kwh: number
  total_cost: number
  device_count: number
  day_count: number
  consumers_energy_kwh: number
  main_feeders_energy_kwh: number
  consumers_count: number
  main_feeders_count: number
}

export interface TrendData {
  period: string
  total_energy: number
  avg_power: number
  record_count: number
}

export interface BreakdownData {
  [key: string]: string | number | undefined
  total_energy: number
  avg_daily: number
  device_count: number
  record_count?: number
  percentage?: number
}

export interface SubDepartmentBreakdown {
  process_area: string
  total_energy: number
  sub_departments: Array<{
    sub_department: string
    total_energy: number
    percentage: number
    device_count: number
  }>
}

export interface DeviceBreakdown extends BreakdownData {
  device__id: number
  device__name: string
  device__process_area: string
  device__floor: string
  device__load_type: string
  peak_daily: number
}

export interface HeatmapData {
  devices: Array<{
    id: number
    name: string
    data: Record<string, number>
  }>
  dates: string[]
}

export interface AnalyticsSummary {
  overall_stats: {
    total_energy: number
    avg_daily: number
    peak_daily: number
    min_daily: number
    total_cost: number | null
    device_count: number
    day_count: number
  }
  process_breakdown: BreakdownData[]
  floor_breakdown: BreakdownData[]
  top_devices: DeviceBreakdown[]
  main_feeders: DeviceBreakdown[]
  daily_trends: TrendData[]
}

export interface FilterParams {
  start_date?: string
  end_date?: string
  process_area?: string
  floor?: string
  load_type?: string
  device_ids?: string
  group_by?: 'day' | 'week' | 'month'
  limit?: number
  include_main?: boolean
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(params: FilterParams = {}): Promise<DashboardStats> {
  const queryParams = new URLSearchParams()
  if (params.start_date) queryParams.append('start_date', params.start_date)
  if (params.end_date) queryParams.append('end_date', params.end_date)
  if (params.process_area) queryParams.append('process_area', params.process_area)
  if (params.floor) queryParams.append('floor', params.floor)
  if (params.load_type) queryParams.append('load_type', params.load_type)
  if (params.device_ids) queryParams.append('device_ids', params.device_ids)

  const response = await fetch(`${API_BASE()}/analytics/energy-summaries/dashboard-stats/?${queryParams}`)
  if (!response.ok) throw new Error('Failed to fetch dashboard stats')
  return response.json()
}

/**
 * Get energy trends
 */
export async function getTrends(params: FilterParams = {}): Promise<TrendData[]> {
  const queryParams = new URLSearchParams()
  if (params.start_date) queryParams.append('start_date', params.start_date)
  if (params.end_date) queryParams.append('end_date', params.end_date)
  if (params.process_area) queryParams.append('process_area', params.process_area)
  if (params.floor) queryParams.append('floor', params.floor)
  if (params.load_type) queryParams.append('load_type', params.load_type)
  if (params.device_ids) queryParams.append('device_ids', params.device_ids)
  if (params.include_main) queryParams.append('include_main', 'true')
  queryParams.append('group_by', params.group_by || 'day')

  const response = await fetch(`${API_BASE()}/analytics/energy-summaries/trends/?${queryParams}`)
  if (!response.ok) throw new Error('Failed to fetch trends')
  return response.json()
}

/**
 * Get breakdown by process area
 */
export async function getProcessAreaBreakdown(params: FilterParams = {}): Promise<BreakdownData[]> {
  const queryParams = new URLSearchParams()
  if (params.start_date) queryParams.append('start_date', params.start_date)
  if (params.end_date) queryParams.append('end_date', params.end_date)
  if (params.floor) queryParams.append('floor', params.floor)
  if (params.load_type) queryParams.append('load_type', params.load_type)
  if (params.device_ids) queryParams.append('device_ids', params.device_ids)

  const response = await fetch(`${API_BASE()}/analytics/energy-summaries/by-process-area/?${queryParams}`)
  if (!response.ok) throw new Error('Failed to fetch process area breakdown')
  return response.json()
}

/**
 * Get breakdown by floor
 */
export async function getFloorBreakdown(params: FilterParams = {}): Promise<BreakdownData[]> {
  const queryParams = new URLSearchParams()
  if (params.start_date) queryParams.append('start_date', params.start_date)
  if (params.end_date) queryParams.append('end_date', params.end_date)
  if (params.process_area) queryParams.append('process_area', params.process_area)
  if (params.load_type) queryParams.append('load_type', params.load_type)
  if (params.device_ids) queryParams.append('device_ids', params.device_ids)

  const response = await fetch(`${API_BASE()}/analytics/energy-summaries/by-floor/?${queryParams}`)
  if (!response.ok) throw new Error('Failed to fetch floor breakdown')
  return response.json()
}

/**
 * Get breakdown by sub-department within each process area
 */
export async function getSubDepartmentBreakdown(params: FilterParams = {}): Promise<SubDepartmentBreakdown[]> {
  const queryParams = new URLSearchParams()
  if (params.start_date) queryParams.append('start_date', params.start_date)
  if (params.end_date) queryParams.append('end_date', params.end_date)
  if (params.process_area) queryParams.append('process_area', params.process_area)
  if (params.floor) queryParams.append('floor', params.floor)
  if (params.load_type) queryParams.append('load_type', params.load_type)
  if (params.device_ids) queryParams.append('device_ids', params.device_ids)

  const response = await fetch(`${API_BASE()}/analytics/energy-summaries/by-sub-department/?${queryParams}`)
  if (!response.ok) throw new Error('Failed to fetch sub-department breakdown')
  return response.json()
}

/**
 * Get breakdown by device
 */
export async function getDeviceBreakdown(params: FilterParams = {}): Promise<DeviceBreakdown[]> {
  const queryParams = new URLSearchParams()
  if (params.start_date) queryParams.append('start_date', params.start_date)
  if (params.end_date) queryParams.append('end_date', params.end_date)
  if (params.process_area) queryParams.append('process_area', params.process_area)
  if (params.floor) queryParams.append('floor', params.floor)
  if (params.load_type) queryParams.append('load_type', params.load_type)
  if (params.device_ids) queryParams.append('device_ids', params.device_ids)
  if (params.limit) queryParams.append('limit', params.limit.toString())
  if (params.include_main) queryParams.append('include_main', 'true')

  const response = await fetch(`${API_BASE()}/analytics/energy-summaries/by-device/?${queryParams}`)
  if (!response.ok) throw new Error('Failed to fetch device breakdown')
  return response.json()
}

/**
 * Get main feeders (incoming feeders) data
 */
export async function getMainFeeders(params: FilterParams = {}): Promise<DeviceBreakdown[]> {
  const queryParams = new URLSearchParams()
  if (params.start_date) queryParams.append('start_date', params.start_date)
  if (params.end_date) queryParams.append('end_date', params.end_date)
  if (params.process_area) queryParams.append('process_area', params.process_area)
  if (params.floor) queryParams.append('floor', params.floor)
  if (params.device_ids) queryParams.append('device_ids', params.device_ids)

  const response = await fetch(`${API_BASE()}/analytics/energy-summaries/main-feeders/?${queryParams}`)
  if (!response.ok) throw new Error('Failed to fetch main feeders')
  return response.json()
}

/**
 * Get heatmap data
 */
export async function getHeatmapData(params: FilterParams = {}): Promise<HeatmapData> {
  const queryParams = new URLSearchParams()
  if (params.start_date) queryParams.append('start_date', params.start_date)
  if (params.end_date) queryParams.append('end_date', params.end_date)
  if (params.process_area) queryParams.append('process_area', params.process_area)
  if (params.floor) queryParams.append('floor', params.floor)
  if (params.load_type) queryParams.append('load_type', params.load_type)
  if (params.device_ids) queryParams.append('device_ids', params.device_ids)
  if (params.include_main) queryParams.append('include_main', 'true')

  const response = await fetch(`${API_BASE()}/analytics/energy-summaries/heatmap-data/?${queryParams}`)
  if (!response.ok) throw new Error('Failed to fetch heatmap data')
  return response.json()
}

/**
 * Get comprehensive analytics summary
 */
export async function getAnalyticsSummary(params: FilterParams = {}): Promise<AnalyticsSummary> {
  const queryParams = new URLSearchParams()
  if (params.start_date) queryParams.append('start_date', params.start_date)
  if (params.end_date) queryParams.append('end_date', params.end_date)
  if (params.process_area) queryParams.append('process_area', params.process_area)
  if (params.floor) queryParams.append('floor', params.floor)
  if (params.load_type) queryParams.append('load_type', params.load_type)
  if (params.device_ids) queryParams.append('device_ids', params.device_ids)

  const response = await fetch(`${API_BASE()}/analytics/energy-insights/summary/?${queryParams}`)
  if (!response.ok) throw new Error('Failed to fetch analytics summary')
  return response.json()
}

/**
 * Get energy summaries with filters
 */
export async function getEnergySummaries(params: FilterParams = {}): Promise<EnergySummary[]> {
  const queryParams = new URLSearchParams()
  if (params.start_date) queryParams.append('start_date', params.start_date)
  if (params.end_date) queryParams.append('end_date', params.end_date)
  if (params.process_area) queryParams.append('process_area', params.process_area)
  if (params.floor) queryParams.append('floor', params.floor)
  if (params.load_type) queryParams.append('load_type', params.load_type)
  if (params.device_ids) queryParams.append('device_ids', params.device_ids)

  const response = await fetch(`${API_BASE()}/analytics/energy-summaries/?${queryParams}`)
  if (!response.ok) throw new Error('Failed to fetch energy summaries')
  const data = await response.json()
  return Array.isArray(data) ? data : data.results || []
}
