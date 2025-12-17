'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar, Filter, RefreshCw } from 'lucide-react'
import DataCard from '../components/reporting/DataCard'
import EnergyMixChart from '../components/reporting/EnergyMixChart'
import TrendChart from '../components/reporting/TrendChart'
import ConsumptionTable from '../components/reporting/ConsumptionTable'
import EfficiencyTrendChart from '../components/reporting/EfficiencyTrendChart'
import DeviceBreakdownTable from '../components/reporting/DeviceBreakdownTable'
import EngineeringDashboard from '../components/reporting/EngineeringDashboard'
import CapacityLoad from '../components/reporting/CapacityLoad'
import FloorBreakdown from '../components/reporting/FloorBreakdown'
import OvertimeAnalysis from '../components/reporting/OvertimeAnalysis'
import {
  getDashboardData,
  getEnergyMix,
  type DashboardResponse,
  type EnergyMix,
} from '../api/reporting'
import { useModbusDevices } from '../hooks/useModbusDevices'

type ViewType = 'daily' | 'monthly'

export default function ReportingDashboardPage() {
  const [viewType, setViewType] = useState<ViewType>('monthly')
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  )
  const [selectedDevices, setSelectedDevices] = useState<number[]>([])
  const [selectedProcess, setSelectedProcess] = useState<string>('')
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>('')
  const [selectedEnergyType, setSelectedEnergyType] = useState<string>('both')
  const [selectedFloor, setSelectedFloor] = useState<string>('')
  const [selectedLoadType, setSelectedLoadType] = useState<string>('')
  const [showOvertime, setShowOvertime] = useState<boolean>(false)
  const [tablePage, setTablePage] = useState(1)
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null)
  const [energyMix, setEnergyMix] = useState<EnergyMix[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { devices } = useModbusDevices()

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params: any = {
        devices: selectedDevices.length > 0 ? selectedDevices : undefined,
        process: selectedProcess || undefined,
        device_type: selectedDeviceType || undefined,
        energy_type: selectedEnergyType,
        floor: selectedFloor || undefined,
        load_type: selectedLoadType || undefined,
        is_overtime: showOvertime || undefined,
        page: viewType === 'monthly' ? tablePage : undefined,
        page_size: 20,
      }

      if (viewType === 'monthly') {
        params.month = selectedMonth
      } else {
        params.date = selectedDate
      }

      const data = await getDashboardData(params)
      setDashboardData(data)

      // Also fetch energy mix separately for detailed view
      const mixData = await getEnergyMix(params)
      setEnergyMix(mixData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }, [viewType, selectedDate, selectedMonth, selectedDevices, selectedProcess, selectedDeviceType, selectedEnergyType, selectedFloor, selectedLoadType, showOvertime, tablePage])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const handleComponentClick = useCallback(
    (component: string) => {
      // Filter other visualizations when component is clicked
      console.log('Component clicked:', component)
      // Could implement filtering logic here
    },
    []
  )

  const handleMonthClick = useCallback(
    (month: string) => {
      // Drill down to daily view
      setSelectedMonth(month)
      setViewType('daily')
      // Set date to first of month
      const firstDay = `${month}-01`
      setSelectedDate(firstDay)
    },
    []
  )

  const processOptions = ['denim', 'washing', 'finishing', 'sewing']

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Energy Reporting Dashboard
        </h1>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Data Cards - ABOVE FILTERS */}
      {!loading && dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dashboardData.data_cards.map((card, index) => (
            <DataCard key={index} card={card} />
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {/* View Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              View Type
            </label>
            <select
              value={viewType}
              onChange={(e) => setViewType(e.target.value as ViewType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {/* Date/Month Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {viewType === 'monthly' ? 'Month' : 'Date'}
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={viewType === 'monthly' ? 'month' : 'date'}
                value={viewType === 'monthly' ? selectedMonth : selectedDate}
                onChange={(e) =>
                  viewType === 'monthly'
                    ? setSelectedMonth(e.target.value)
                    : setSelectedDate(e.target.value)
                }
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {/* Device Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Devices
            </label>
            <select
              multiple
              value={selectedDevices.map(String)}
              onChange={(e) =>
                setSelectedDevices(
                  Array.from(e.target.selectedOptions, (option) => parseInt(option.value))
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              size={3}
            >
              <option value="">All Devices</option>
              {devices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.name}
                </option>
              ))}
            </select>
          </div>

          {/* Process Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Process
            </label>
            <select
              value={selectedProcess}
              onChange={(e) => setSelectedProcess(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Processes</option>
              {processOptions.map((process) => (
                <option key={process} value={process}>
                  {process.charAt(0).toUpperCase() + process.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Device Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Device Type
            </label>
            <select
              value={selectedDeviceType}
              onChange={(e) => setSelectedDeviceType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Types</option>
              <option value="electricity">Electricity</option>
              <option value="flowmeter">Flowmeter (Steam)</option>
              <option value="temp_gauge">Temperature</option>
            </select>
          </div>

          {/* Energy Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Energy Type
            </label>
            <select
              value={selectedEnergyType}
              onChange={(e) => {
                setSelectedEnergyType(e.target.value)
                setTablePage(1) // Reset to first page on filter change
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="both">Both (Cost)</option>
              <option value="electricity">Electricity Only</option>
              <option value="steam">Steam Only</option>
            </select>
          </div>

          {/* Floor Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Floor
            </label>
            <select
              value={selectedFloor}
              onChange={(e) => {
                setSelectedFloor(e.target.value)
                setTablePage(1)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Floors</option>
              <option value="GF">Ground Floor (GF)</option>
              <option value="FF">First Floor (FF)</option>
              <option value="SF">Second Floor (SF)</option>
              <option value="WF">Washing Floor (WF)</option>
            </select>
          </div>

          {/* Load Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Load Type
            </label>
            <select
              value={selectedLoadType}
              onChange={(e) => {
                setSelectedLoadType(e.target.value)
                setTablePage(1)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Load Types</option>
              <option value="LT01">Load Type 01 (LT01)</option>
              <option value="LT02">Load Type 02 (LT02)</option>
              <option value="MAIN">Main</option>
            </select>
          </div>

          {/* Overtime Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Overtime Data
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showOvertime}
                onChange={(e) => {
                  setShowOvertime(e.target.checked)
                  setTablePage(1)
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Show Overtime</span>
            </label>
          </div>
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
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
        </div>
      )}

      {/* Dashboard Content */}
      {!loading && dashboardData && (
        <>

          {/* Department Energy Mix Pie Charts */}
          {dashboardData.view_type === 'monthly' && dashboardData.department_energy_mix && dashboardData.department_energy_mix.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Energy Mix by Department
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {dashboardData.department_energy_mix.map((mix, index) => (
                  <EnergyMixChart
                    key={`dept-${index}`}
                    energyMix={mix}
                    onComponentClick={handleComponentClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Energy Mix Charts - Top Row (Process-based) */}
          {dashboardData.view_type === 'monthly' && energyMix.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Energy Mix by Process
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {energyMix.map((mix, index) => (
                  <EnergyMixChart
                    key={`process-${index}`}
                    energyMix={mix}
                    onComponentClick={handleComponentClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Detailed Device Breakdown Table */}
          {dashboardData.view_type === 'monthly' && dashboardData.device_table && (
            <DeviceBreakdownTable
              data={dashboardData.device_table}
              onPageChange={(page) => {
                setTablePage(page)
              }}
            />
          )}

          {/* Consumption Table */}
          {dashboardData.view_type === 'monthly' && dashboardData.consumption_table && (
            <ConsumptionTable data={dashboardData.consumption_table} />
          )}

          {/* Monthly Trends */}
          {dashboardData.view_type === 'monthly' && dashboardData.monthly_trends && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Monthly Trends
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(dashboardData.monthly_trends).map(([key, trendData]) => (
                  <TrendChart
                    key={key}
                    title={key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    data={trendData}
                    onClick={handleMonthClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Engineering Dashboard */}
          {dashboardData.view_type === 'monthly' && (
            <EngineeringDashboard date={selectedMonth ? `${selectedMonth}-01` : undefined} />
          )}

          {/* Floor Breakdown */}
          {dashboardData.view_type === 'monthly' && (
            <FloorBreakdown
              month={selectedMonth}
              processArea={selectedProcess || undefined}
            />
          )}

          {/* Overtime Analysis */}
          {dashboardData.view_type === 'monthly' && (
            <OvertimeAnalysis
              month={selectedMonth}
              processArea={selectedProcess || undefined}
            />
          )}

          {/* Capacity Load */}
          {dashboardData.view_type === 'monthly' && (
            <CapacityLoad
              processArea={selectedProcess || undefined}
              location={selectedFloor || undefined}
            />
          )}

          {/* Efficiency Trend Charts - Bottom Row */}
          {dashboardData.view_type === 'monthly' && dashboardData.efficiency_metrics && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Efficiency Trends (kWh/Garment) vs Targets
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(dashboardData.efficiency_metrics).map(([process, metrics]) => {
                  if (!Array.isArray(metrics)) return null
                  const title = process === 'overall' 
                    ? 'OVERALL kWh/G' 
                    : `Overall ${process.toUpperCase()} kWh/G`
                  // Let the chart component calculate the domain dynamically based on data
                  // This ensures the range fits the actual data values
                  return (
                    <EfficiencyTrendChart
                      key={process}
                      title={title}
                      data={metrics}
                    />
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}



