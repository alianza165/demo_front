/**
 * API service for reporting and dashboard endpoints
 * Uses Next.js API proxy routes (like other services)
 */

const API_BASE = '/api'  // Use Next.js proxy route

export interface DashboardDataCard {
  title: string
  value: number | null
  unit: string
  change: number | null
  change_percentage: number | null
  trend: 'up' | 'down' | 'stable' | null
}

export interface EnergyMixComponent {
  name: string
  value: number
  percentage: number
  color?: string | null
}

export interface EnergyMix {
  device_name: string
  total_kwh: number
  load_kw: number
  components: EnergyMixComponent[]
}

export interface MonthlyTrendData {
  month: string
  value: number
  zone: 'green' | 'yellow' | 'red'
  target?: number | null
}

export interface EfficiencyMetric {
  date: string
  achieved: number
  target?: number | null
  benchmark?: number | null
  zone: 'green' | 'yellow' | 'red'
}

export interface ConsumptionTableRow {
  month: string
  total_energy: number
  total_garments: number
  overall_kwh_g: number
  processes: {
    [process: string]: {
      energy: number
      garments: number
      kwh_g: number
    }
  }
}

export interface DeviceBreakdownRow {
  device_id: number
  device_name: string
  device_type: string
  location: string
  department?: string
  process?: string
  machine_type?: string
  total_energy_kwh: number
  avg_daily_energy_kwh: number
  peak_power_kw: number
  total_cost_usd: number
  component_breakdown: Record<string, number>
  units_produced?: number | null
  efficiency_kwh_per_unit?: number | null
}

export interface DeviceBreakdownTable {
  results: DeviceBreakdownRow[]
  count: number
  page: number
  page_size: number
  total_pages: number
}

export interface DashboardResponse {
  date?: string
  month?: string
  view_type: 'daily' | 'monthly'
  data_cards: DashboardDataCard[]
  energy_mix: EnergyMix[]
  department_energy_mix?: EnergyMix[]  // Pie charts per department
  monthly_trends?: Record<string, MonthlyTrendData[]>
  consumption_table?: ConsumptionTableRow[]
  device_table?: DeviceBreakdownTable
  efficiency_metrics?: Record<string, EfficiencyMetric[]>
}

export interface DailyAggregate {
  id: number
  device: number
  device_name?: string
  device_process_area?: string
  device_floor?: string
  device_load_type?: string
  date: string
  date_str: string
  total_energy_kwh: number
  avg_power_kw: number
  peak_power_kw: number
  component_breakdown: Record<string, number>
  units_produced?: number | null
  efficiency_kwh_per_unit?: number | null
  total_cost: number
  is_overtime: boolean
  meter_reading?: number | null
  daily_units_kwh?: number | null
  last_calculated: string
}

export interface EngineeringDashboard {
  id: number
  date: string
  kwh_generated?: number | null
  kw_avg?: number | null
  kw_peak?: number | null
  avg_flow_tons_per_hr?: number | null
  husk_kgs?: number | null
  steam_tons?: number | null
  wastage_kg?: number | null
  gas_availability?: boolean | null
  gen_set_from?: string | null
  gen_set_to?: string | null
  gen_set_hours?: number | null
  dg_engine?: string | null
  downtime?: number | null
  notes?: string
  created_at: string
  updated_at: string
}

export interface CapacityLoad {
  id: number
  name: string
  equipment_type: 'production_line' | 'exhaust_fan' | 'highbay' | 'other'
  process_area: string
  location: 'GF' | 'FF' | 'SF' | 'WF'
  quantity: number
  power_per_unit_kw: number
  total_load_kw: number
  shift_hours: number
  daily_kwh?: number | null
  monthly_kwh?: number | null
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductionData {
  id?: number
  device: number
  date: string
  units_produced: number
  shift_type: 'LT01' | 'LT02' | 'MAIN' | 'full_day'
  notes?: string
}

export interface EfficiencyBenchmark {
  id?: number
  device?: number | null
  device_name?: string | null
  benchmark_type: 'best_day' | 'best_week' | 'best_month' | 'average' | 'median' | 'custom'
  metric_name: string
  benchmark_value: number
  period_start?: string | null
  period_end?: string | null
  is_active: boolean
}

export interface Target {
  id?: number
  device?: number | null
  device_name?: string | null
  metric_name: string
  target_period: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  period_start: string
  period_end: string
  target_value: number
  current_value: number
  is_on_track: boolean
  progress_percentage: number
}

/**
 * Fetch dashboard data
 */
export async function getDashboardData(params?: {
  date?: string
  month?: string
  devices?: number[]
  process?: string
  device_type?: string
  energy_type?: string
  page?: number
  page_size?: number
  floor?: string
  load_type?: string
  is_overtime?: boolean
}): Promise<DashboardResponse> {
  const queryParams = new URLSearchParams()
  
  if (params?.date) queryParams.append('date', params.date)
  if (params?.month) queryParams.append('month', params.month)
  if (params?.devices?.length) queryParams.append('devices', params.devices.join(','))
  if (params?.process) queryParams.append('process', params.process)
  if (params?.device_type) queryParams.append('device_type', params.device_type)
  if (params?.energy_type) queryParams.append('energy_type', params.energy_type)
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.page_size) queryParams.append('page_size', params.page_size.toString())
  if (params?.floor) queryParams.append('floor', params.floor)
  if (params?.load_type) queryParams.append('load_type', params.load_type)
  if (params?.is_overtime !== undefined) queryParams.append('is_overtime', params.is_overtime.toString())
  
  const response = await fetch(`${API_BASE}/reporting/dashboard/?${queryParams}`)
  if (!response.ok) {
    let errorMessage = `Failed to fetch dashboard data: ${response.statusText}`
    try {
      const errorData = await response.json()
      errorMessage = errorData.detail || errorData.error || errorMessage
    } catch {
      // If response is not JSON, use status text
    }
    throw new Error(errorMessage)
  }
  return response.json()
}

/**
 * Fetch energy mix data
 */
export async function getEnergyMix(params?: {
  date?: string
  month?: string
  devices?: number[]
}): Promise<EnergyMix[]> {
  const queryParams = new URLSearchParams()
  
  if (params?.date) queryParams.append('date', params.date)
  if (params?.month) queryParams.append('month', params.month)
  if (params?.devices?.length) queryParams.append('devices', params.devices.join(','))
  
  const response = await fetch(`${API_BASE}/reporting/energy-mix/?${queryParams}`)
  if (!response.ok) {
    let errorMessage = `Failed to fetch energy mix: ${response.statusText}`
    try {
      const errorData = await response.json()
      errorMessage = errorData.detail || errorData.error || errorMessage
    } catch {
      // If response is not JSON, use status text
    }
    throw new Error(errorMessage)
  }
  return response.json()
}

/**
 * Production Data CRUD
 */
export async function getProductionData(params?: {
  device?: number
  date?: string
  shift_type?: string
}): Promise<ProductionData[]> {
  const queryParams = new URLSearchParams()
  if (params?.device) queryParams.append('device', params.device.toString())
  if (params?.date) queryParams.append('date', params.date)
  if (params?.shift_type) queryParams.append('shift_type', params.shift_type)
  
  const response = await fetch(`${API_BASE}/reporting/production-data/?${queryParams}`)
  if (!response.ok) {
    let errorMessage = `Failed to fetch production data: ${response.statusText}`
    try {
      const errorData = await response.json()
      errorMessage = errorData.detail || errorData.error || errorMessage
    } catch {
      // If response is not JSON, use status text
    }
    throw new Error(errorMessage)
  }
  return response.json()
}

export async function createProductionData(data: ProductionData): Promise<ProductionData> {
  const response = await fetch(`${API_BASE}/reporting/production-data/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    let errorMessage = `Failed to create production data: ${response.statusText}`
    try {
      const errorData = await response.json()
      errorMessage = errorData.detail || errorData.error || errorMessage
    } catch {
      // If response is not JSON, use status text
    }
    throw new Error(errorMessage)
  }
  return response.json()
}

export async function updateProductionData(id: number, data: Partial<ProductionData>): Promise<ProductionData> {
  const response = await fetch(`${API_BASE}/reporting/production-data/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    let errorMessage = `Failed to update production data: ${response.statusText}`
    try {
      const errorData = await response.json()
      errorMessage = errorData.detail || errorData.error || errorMessage
    } catch {
      // If response is not JSON, use status text
    }
    throw new Error(errorMessage)
  }
  return response.json()
}

export async function deleteProductionData(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/reporting/production-data/${id}/`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    let errorMessage = `Failed to delete production data: ${response.statusText}`
    try {
      const errorData = await response.json()
      errorMessage = errorData.detail || errorData.error || errorMessage
    } catch {
      // If response is not JSON, use status text
    }
    throw new Error(errorMessage)
  }
}

/**
 * Benchmarks
 */
export async function getBenchmarks(params?: {
  device?: number
  metric_name?: string
  benchmark_type?: string
}): Promise<EfficiencyBenchmark[]> {
  const queryParams = new URLSearchParams()
  if (params?.device) queryParams.append('device', params.device.toString())
  if (params?.metric_name) queryParams.append('metric_name', params.metric_name)
  if (params?.benchmark_type) queryParams.append('benchmark_type', params.benchmark_type)
  
  const response = await fetch(`${API_BASE}/reporting/benchmarks/?${queryParams}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch benchmarks: ${response.statusText}`)
  }
  return response.json()
}

/**
 * Targets
 */
export async function getTargets(params?: {
  device?: number
  metric_name?: string
  target_period?: string
  is_on_track?: boolean
}): Promise<Target[]> {
  const queryParams = new URLSearchParams()
  if (params?.device) queryParams.append('device', params.device.toString())
  if (params?.metric_name) queryParams.append('metric_name', params.metric_name)
  if (params?.target_period) queryParams.append('target_period', params.target_period)
  if (params?.is_on_track !== undefined) queryParams.append('is_on_track', params.is_on_track.toString())
  
  const response = await fetch(`${API_BASE}/reporting/targets/?${queryParams}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch targets: ${response.statusText}`)
  }
  return response.json()
}

/**
 * Daily Aggregates
 */
export async function getDailyAggregates(params?: {
  device?: number
  date?: string
  process_area?: string
  floor?: string
  load_type?: string
  is_overtime?: boolean
}): Promise<DailyAggregate[]> {
  const queryParams = new URLSearchParams()
  if (params?.device) queryParams.append('device', params.device.toString())
  if (params?.date) queryParams.append('date', params.date)
  if (params?.process_area) queryParams.append('process_area', params.process_area)
  if (params?.floor) queryParams.append('floor', params.floor)
  if (params?.load_type) queryParams.append('load_type', params.load_type)
  if (params?.is_overtime !== undefined) queryParams.append('is_overtime', params.is_overtime.toString())
  
  const response = await fetch(`${API_BASE}/reporting/daily-aggregates/?${queryParams}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch daily aggregates: ${response.statusText}`)
  }
  const data = await response.json()
  // Ensure we always return an array
  return Array.isArray(data) ? data : (data.results ? data.results : [])
}

/**
 * Engineering Dashboard
 */
export async function getEngineeringDashboard(params?: {
  date?: string
}): Promise<EngineeringDashboard[]> {
  const queryParams = new URLSearchParams()
  if (params?.date) queryParams.append('date', params.date)
  
  const response = await fetch(`${API_BASE}/reporting/engineering-dashboard/?${queryParams}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch engineering dashboard: ${response.statusText}`)
  }
  const data = await response.json()
  // Ensure we always return an array
  return Array.isArray(data) ? data : (data.results ? data.results : [])
}

/**
 * Capacity Loads
 */
export async function getCapacityLoads(params?: {
  equipment_type?: string
  process_area?: string
  location?: string
  is_active?: boolean
}): Promise<CapacityLoad[]> {
  const queryParams = new URLSearchParams()
  if (params?.equipment_type) queryParams.append('equipment_type', params.equipment_type)
  if (params?.process_area) queryParams.append('process_area', params.process_area)
  if (params?.location) queryParams.append('location', params.location)
  if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString())
  
  const response = await fetch(`${API_BASE}/reporting/capacity-loads/?${queryParams}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch capacity loads: ${response.statusText}`)
  }
  const data = await response.json()
  // Ensure we always return an array
  return Array.isArray(data) ? data : (data.results ? data.results : [])
}

