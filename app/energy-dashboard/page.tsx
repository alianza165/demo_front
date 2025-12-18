'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar, Filter, TrendingUp, Zap, DollarSign, BarChart3, Activity, Layers } from 'lucide-react'
import {
  getDashboardStats,
  getTrends,
  getProcessAreaBreakdown,
  getFloorBreakdown,
  getDeviceBreakdown,
  getMainFeeders,
  getSubDepartmentBreakdown,
  getHeatmapData,
  getAnalyticsSummary,
  type FilterParams,
  type DashboardStats,
  type TrendData,
  type BreakdownData,
  type DeviceBreakdown,
  type SubDepartmentBreakdown,
} from '../api/energy-analytics'
import { useModbusDevices } from '../hooks/useModbusDevices'
import EnergyTrendChart from '../components/energy-dashboard/EnergyTrendChart'
import ProcessAreaPieChart from '../components/energy-dashboard/ProcessAreaPieChart'
import FloorBarChart from '../components/energy-dashboard/FloorBarChart'
import DeviceComparisonChart from '../components/energy-dashboard/DeviceComparisonChart'
import EnergyHeatmap from '../components/energy-dashboard/EnergyHeatmap'
import DailyEnergyChart from '../components/energy-dashboard/DailyEnergyChart'
import StatsCards from '../components/energy-dashboard/StatsCards'
import MainFeedersChart from '../components/energy-dashboard/MainFeedersChart'
import DeviceMultiSelect from '../components/energy-dashboard/DeviceMultiSelect'
import SubDepartmentChart from '../components/energy-dashboard/SubDepartmentChart'

export default function EnergyDashboardPage() {
  const { devices } = useModbusDevices()
  
  // Filter states
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [selectedProcessArea, setSelectedProcessArea] = useState<string>('')
  const [selectedFloor, setSelectedFloor] = useState<string>('')
  const [selectedLoadType, setSelectedLoadType] = useState<string>('')
  const [selectedDevices, setSelectedDevices] = useState<number[]>([])
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day')
  
  // Data states
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [trends, setTrends] = useState<TrendData[]>([])
  const [processBreakdown, setProcessBreakdown] = useState<BreakdownData[]>([])
  const [floorBreakdown, setFloorBreakdown] = useState<BreakdownData[]>([])
  const [deviceBreakdown, setDeviceBreakdown] = useState<DeviceBreakdown[]>([])
  const [mainFeeders, setMainFeeders] = useState<DeviceBreakdown[]>([])
  const [subDepartmentBreakdown, setSubDepartmentBreakdown] = useState<SubDepartmentBreakdown[]>([])
  const [heatmapData, setHeatmapData] = useState<any>(null)
  const [includeMain, setIncludeMain] = useState<boolean>(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Build filter params
  const buildFilterParams = useCallback((): FilterParams => {
    return {
      start_date: startDate,
      end_date: endDate,
      process_area: selectedProcessArea || undefined,
      floor: selectedFloor || undefined,
      load_type: selectedLoadType || undefined,
      device_ids: selectedDevices.length > 0 ? selectedDevices.join(',') : undefined,
      group_by: groupBy,
    }
  }, [startDate, endDate, selectedProcessArea, selectedFloor, selectedLoadType, selectedDevices, groupBy])

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = buildFilterParams()
      
      const [
        stats,
        trendsData,
        processData,
        floorData,
        deviceData,
        mainFeedersData,
        subDeptData,
        heatmap,
      ] = await Promise.all([
        getDashboardStats(params),
        getTrends({ ...params, include_main: includeMain }),
        getProcessAreaBreakdown(params),
        getFloorBreakdown(params),
        getDeviceBreakdown({ ...params, limit: 15, include_main: includeMain }),
        getMainFeeders(params),
        getSubDepartmentBreakdown(params),
        getHeatmapData({ ...params, include_main: includeMain }),
      ])
      
      setDashboardStats(stats)
      setTrends(trendsData)
      setProcessBreakdown(processData)
      setFloorBreakdown(floorData)
      setDeviceBreakdown(deviceData)
      setMainFeeders(mainFeedersData)
      setSubDepartmentBreakdown(subDeptData)
      setHeatmapData(heatmap)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }, [buildFilterParams])

  useEffect(() => {
    fetchData()
  }, [fetchData, includeMain])

  // Get unique values for filters
  const processAreas = Array.from(new Set(devices.map(d => d.process_area).filter(Boolean)))
  const floors = Array.from(new Set(devices.map(d => d.floor).filter(Boolean)))
  const loadTypes = Array.from(new Set(devices.map(d => d.load_type).filter(Boolean)))

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Zap className="w-8 h-8 text-yellow-500" />
            Energy Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive energy consumption analysis and insights
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Activity className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards - Show First */}
      {!loading && dashboardStats && (
        <StatsCards stats={dashboardStats} />
      )}

      {/* Filters - Show Below Stats Cards */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {/* Process Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Process Area
            </label>
            <select
              value={selectedProcessArea}
              onChange={(e) => setSelectedProcessArea(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Processes</option>
              {processAreas.map(area => (
                <option key={area} value={area}>
                  {area.charAt(0).toUpperCase() + area.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Floor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Floor
            </label>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Floors</option>
              {floors.map(floor => (
                <option key={floor} value={floor}>
                  {floor}
                </option>
              ))}
            </select>
          </div>

          {/* Load Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Load Type
            </label>
            <select
              value={selectedLoadType}
              onChange={(e) => setSelectedLoadType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Load Types</option>
              {loadTypes.map(load => (
                <option key={load} value={load}>
                  {load}
                </option>
              ))}
            </select>
          </div>

          {/* Group By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Group By
            </label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as 'day' | 'week' | 'month')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
          </div>

          {/* Include Main Feeders Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Include Main Feeders
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeMain}
                onChange={(e) => setIncludeMain(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Show incoming feeders in trends
              </span>
            </label>
          </div>
        </div>

        {/* Device Multi-select */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Devices
          </label>
          <DeviceMultiSelect
            devices={devices}
            selectedDevices={selectedDevices}
            onChange={setSelectedDevices}
            placeholder="Select devices to filter (leave empty for all)"
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <Activity className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
        </div>
      )}

      {/* Info Banner */}
      {!loading && dashboardStats && dashboardStats.main_feeders_count > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Main Feeders vs Consumers
              </h3>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                <strong>Main Feeders</strong> ({dashboardStats.main_feeders_count} devices, {dashboardStats.main_feeders_energy_kwh.toFixed(0)} kWh) are incoming LT panels that supply power to different areas. 
                <strong> Consumers</strong> ({dashboardStats.consumers_count} devices, {dashboardStats.consumers_energy_kwh.toFixed(0)} kWh) are the actual process equipment. 
                Process and floor breakdowns show consumers only, as main feeders represent supply, not consumption by process.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Content - Charts */}
      {!loading && dashboardStats && (
        <>
          {/* Main Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Energy Trends */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Energy Consumption Trends
              </h3>
              <EnergyTrendChart data={trends} groupBy={groupBy} />
            </div>

            {/* Process Area Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Energy by Process Area (Consumers Only)
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Main feeders excluded - showing consumer devices only
              </p>
              <ProcessAreaPieChart data={processBreakdown} />
            </div>
          </div>

          {/* Secondary Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Floor Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Energy by Floor (Consumers Only)
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Main feeders excluded - showing consumer devices only
              </p>
              <FloorBarChart data={floorBreakdown} />
            </div>

            {/* Top Devices */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Top Energy Consumers
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {includeMain ? 'Including main feeders' : 'Consumer devices only (main feeders excluded)'}
              </p>
              <DeviceComparisonChart data={deviceBreakdown} />
            </div>
          </div>

          {/* Main Feeders Section */}
          {mainFeeders.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-500" />
                Main Feeders (Incoming Feeders)
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                These are the main LT panels that feed power to different areas. They are shown separately as they represent incoming supply, not consumption by process.
              </p>
              <MainFeedersChart data={mainFeeders} />
            </div>
          )}

          {/* Sub-Department Breakdown */}
          {subDepartmentBreakdown.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Sub-Department Load Breakdown
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Energy consumption by sub-department (Machine, Lights, HVAC, Exhaust, Offices, etc.) within each department
              </p>
              <SubDepartmentChart data={subDepartmentBreakdown} />
            </div>
          )}

          {/* Daily Energy Chart - Full Width */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Daily Energy Consumption {includeMain ? '(Including Main Feeders)' : '(Consumers Only)'}
            </h3>
            <DailyEnergyChart data={trends} />
          </div>

          {/* Heatmap - Full Width */}
          {heatmapData && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Energy Heatmap (Device vs Date)
              </h3>
              <EnergyHeatmap data={heatmapData} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
