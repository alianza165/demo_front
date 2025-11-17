'use client'

import { useMemo, useState, type ReactNode } from 'react'
import DeviceComparison from '../components/analytics/DeviceComparison'
import ShiftAnalysis from '../components/analytics/ShiftAnalysis'
import { useModbusDevices } from '../hooks/useModbusDevices'
import useEnergyAnalytics from '../hooks/useEnergyAnalytics'
import type {
  EnergyAnalyticsResponse,
  EnergySummaryItem,
} from '../services/analytics'

type AnalyticsTab = 'overview' | 'devices' | 'shifts' | 'trends' | 'costs'
type TableRow = Array<string | number | ReactNode | null>

const DATE_INPUT_PLACEHOLDER = ''

function toISODate(value: string, endOfDay = false): string {
  if (!value) return ''
  const suffix = endOfDay ? 'T23:59:59Z' : 'T00:00:00Z'
  return new Date(`${value}${suffix}`).toISOString()
}

function formatScore(score?: number | null): string {
  if (score === null || score === undefined || Number.isNaN(score)) {
    return '—'
  }
  return score.toFixed(1)
}

function ScoreCard({
  title,
  value,
  subtitle,
  accentClass,
}: {
  title: string
  value: string
  subtitle?: string
  accentClass: string
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {title}
      </p>
      <div className="mt-2 flex items-baseline space-x-2">
        <span className={`text-3xl font-semibold ${accentClass}`}>{value}</span>
        {subtitle && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  )
}

function Suggestions({
  overall,
  consumption,
  powerQuality,
  target,
}: {
  overall?: number
  consumption?: number
  powerQuality?: number
  target?: number
}) {
  const recommendations: string[] = []

  if (overall !== undefined) {
    if (overall >= 85) {
      recommendations.push(
        'Energy performance is excellent. Maintain current operations and continue monitoring.'
      )
    } else if (overall >= 70) {
      recommendations.push(
        'Performance is good. Review peak hours for incremental improvements.'
      )
    } else {
      recommendations.push(
        'Performance is below target. Investigate high-consumption processes and schedule load shifting.'
      )
    }
  }

  if (consumption !== undefined && target !== undefined) {
    if (consumption >= 80) {
      recommendations.push(
        'Energy consumption is closely aligned with your target.'
      )
    } else {
      recommendations.push(
        'Consumption deviates from target. Adjust schedules or review equipment efficiency.'
      )
    }
  }

  if (powerQuality !== undefined) {
    if (powerQuality < 70) {
      recommendations.push(
        'Power quality variations detected. Inspect voltage balance and harmonic distortion trends.'
      )
    } else if (powerQuality < 85) {
      recommendations.push(
        'Minor power quality fluctuations observed. Consider checking power factor correction equipment.'
      )
    } else {
      recommendations.push('Power quality is stable.')
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('Set a target to receive tailored recommendations.')
  }

  return (
    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
      {recommendations.map((item, idx) => (
        <li key={idx} className="flex items-start space-x-2">
          <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function DataTable({
  title,
  description,
  headers,
  rows,
  emptyMessage,
}: {
  title: string
  description?: string
  headers: string[]
  rows: TableRow[]
  emptyMessage: string
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {emptyMessage}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {headers.map((header) => (
                  <th
                    key={header}
                    className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {rows.map((row, idx) => (
                <tr key={idx} className="whitespace-nowrap">
                  {row.map((value, cellIdx) => (
                    <td
                      key={cellIdx}
                      className="px-3 py-2 text-gray-700 dark:text-gray-200"
                    >
                      {value ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function renderDailyRows(items: EnergySummaryItem[]): TableRow[] {
  const fmt = (num?: number | null) =>
    num === null || num === undefined ? null : num.toFixed(2)

  return items.map((item) => [
    item.device_id,
    item.date,
    fmt(item.kwh),
    fmt(item.previous_day_kwh),
    fmt(item.difference_kwh),
    item.pct_change !== null && item.pct_change !== undefined
      ? `${item.pct_change.toFixed(1)}%`
      : null,
  ])
}

function renderHourlyRows(
  hourly?: EnergyAnalyticsResponse['hourly_comparison'],
  deviceId?: string
): TableRow[] {
  if (!hourly) return []
  const fmt = (num?: number | null) =>
    num === null || num === undefined ? null : num.toFixed(2)

  const filtered = deviceId
    ? hourly.filter((row) => row.device_id === deviceId)
    : hourly

  return filtered.slice(0, 24).map((row) => [
    row.device_id,
    `${row.hour.toString().padStart(2, '0')}:00`,
    fmt(row.current_kwh),
    fmt(row.previous_kwh),
    fmt(row.difference_kwh),
    row.pct_change !== null && row.pct_change !== undefined
      ? `${row.pct_change.toFixed(1)}%`
      : null,
  ])
}

function renderTrendRows(
  trend?: EnergyAnalyticsResponse['trend'],
  deviceId?: string
): TableRow[] {
  if (!trend) return []

  return trend
    .filter((entry) => {
      if (!deviceId) return true
      const record = entry as Record<string, unknown>
      return record.device_id === deviceId
    })
    .map((entry) => {
      const record = entry as Record<string, unknown>
      const device =
        typeof record.device_id === 'string'
          ? (record.device_id as string)
          : deviceId ?? ''
      const date = record.date ? String(record.date) : ''
      let kwh: string | null = null
      if (typeof record.kwh === 'number') {
        kwh = (record.kwh as number).toFixed(2)
      } else if (record.kwh !== undefined && record.kwh !== null) {
        kwh = String(record.kwh)
      }
      return [device, date, kwh]
    })
}

function renderAnomalyRows(
  anomalies?: EnergyAnalyticsResponse['anomalies'],
  deviceId?: string
): TableRow[] {
  if (!anomalies) return []

  return anomalies
    .filter((entry) => {
      if (!deviceId) return true
      const record = entry as Record<string, unknown>
      return record.device_id === deviceId
    })
    .map((entry) => {
      const record = entry as Record<string, unknown>
      const device =
        typeof record.device_id === 'string'
          ? (record.device_id as string)
          : deviceId ?? ''
      const date = record.date ? String(record.date) : ''
      let kwh: string | null = null
      if (typeof record.kwh === 'number') {
        kwh = (record.kwh as number).toFixed(2)
      } else if (record.kwh !== undefined && record.kwh !== null) {
        kwh = String(record.kwh)
      }
      let zscore: string | null = null
      if (typeof record.zscore === 'number') {
        zscore = (record.zscore as number).toFixed(2)
      } else if (record.zscore !== undefined && record.zscore !== null) {
        zscore = String(record.zscore)
      }
      return [device, date, kwh, zscore]
    })
}

export default function EnergyAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview')
  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const [startDate, setStartDate] = useState<string>(DATE_INPUT_PLACEHOLDER)
  const [endDate, setEndDate] = useState<string>(DATE_INPUT_PLACEHOLDER)
  const [days, setDays] = useState<number>(8)
  const [targetKwh, setTargetKwh] = useState<string>('')

  const { devices, loading: devicesLoading } = useModbusDevices()
  const { data, loading, error, refresh, downloadCsv } = useEnergyAnalytics({
    days,
  })
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d')

  const currentTarget =
    targetKwh.trim().length > 0 ? Number(targetKwh) : undefined

  const primaryDevice = useMemo(() => {
    const fallback =
      data?.devices?.[0] ?? (devices.length > 0 ? devices[0].name : undefined)
    const deviceId = selectedDevice || fallback
    if (!deviceId) return undefined
    return {
      id: deviceId,
      scores: data?.performance_scores?.[deviceId],
    }
  }, [data?.devices, data?.performance_scores, devices, selectedDevice])

  const activeSummary =
    data?.daily_summary.find(
      (item) => item.device_id === primaryDevice?.id
    ) ?? data?.daily_summary[0]

  const handleApplyFilters = () => {
    refresh({
      deviceId: selectedDevice || undefined,
      start: startDate ? toISODate(startDate) : undefined,
      end: endDate ? toISODate(endDate, true) : undefined,
      days,
      targetKwh: currentTarget,
      includeHourly: true,
      includeTrend: true,
    })
  }

  const handleQuickRange = (dayCount: number) => {
    setDays(dayCount)
    setStartDate(DATE_INPUT_PLACEHOLDER)
    setEndDate(DATE_INPUT_PLACEHOLDER)
    refresh({
      deviceId: selectedDevice || undefined,
      days: dayCount,
      targetKwh: currentTarget,
    })
  }

  const overallScore =
    data?.overall_score ?? primaryDevice?.scores?.overall_score
  const consumptionScore = primaryDevice?.scores?.consumption_score
  const powerQualityScore = primaryDevice?.scores?.power_quality_score

  const tabs: { id: AnalyticsTab; name: string; icon: string }[] = [
    { id: 'overview', name: 'Performance Overview', icon: '⭐' },
    { id: 'devices', name: 'Device Comparison', icon: '📊' },
    { id: 'shifts', name: 'Shift Analysis', icon: '🕐' },
    { id: 'trends', name: 'Legacy Trends', icon: '📈' },
    { id: 'costs', name: 'Cost Analysis', icon: '💰' },
  ]

  const dailyRows = data ? renderDailyRows(data.daily_summary) : []
  const hourlyRows = renderHourlyRows(
    data?.hourly_comparison,
    primaryDevice?.id
  )
  const trendRows = renderTrendRows(data?.trend, primaryDevice?.id)
  const anomalyRows = renderAnomalyRows(data?.anomalies, primaryDevice?.id)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Energy Analytics Command Center
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">
            Monitor energy performance, power quality, and progress against
            targets in real time.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Legacy Time Range:
          </span>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Configure Analysis
        </h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Device
            </label>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All devices</option>
              {devicesLoading && <option>Loading...</option>}
              {devices.map((device) => (
                <option key={device.id} value={device.name}>
                  {device.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              From
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              To
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sliding window (days)
            </label>
            <input
              type="number"
              min={1}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Daily target (kWh)
            </label>
            <input
              type="number"
              min={0}
              step="0.1"
              value={targetKwh}
              onChange={(e) => setTargetKwh(e.target.value)}
              placeholder="Optional"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={handleApplyFilters}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Apply filters
          </button>
          <button
            onClick={() => handleQuickRange(7)}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Last 7 days
          </button>
          <button
            onClick={() => handleQuickRange(30)}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Last 30 days
          </button>
          <button
            onClick={() => downloadCsv('all')}
            className="rounded-md border border-blue-500 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-400 dark:text-blue-300 dark:hover:bg-blue-900/30"
          >
            Download CSV
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-300'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {loading ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-300">
              Loading analytics...
            </div>
          ) : dailyRows.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-300">
              No analytics data available for the selected filters.
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <ScoreCard
                  title="Overall Score"
                  value={formatScore(overallScore)}
                  subtitle="Composite energy health"
                  accentClass="text-blue-600"
                />
                <ScoreCard
                  title="Consumption Score"
                  value={formatScore(consumptionScore)}
                  subtitle="Daily consumption vs target"
                  accentClass="text-emerald-600"
                />
                <ScoreCard
                  title="Power Quality Score"
                  value={formatScore(powerQualityScore)}
                  subtitle="Stability across latest day"
                  accentClass="text-purple-600"
                />
                <ScoreCard
                  title="Latest Daily kWh"
                  value={
                    activeSummary?.kwh !== undefined && activeSummary?.kwh !== null
                      ? activeSummary.kwh.toFixed(2)
                      : '—'
                  }
                  subtitle={
                    currentTarget !== undefined && activeSummary?.kwh !== undefined
                      ? `Target ${currentTarget.toFixed(1)} kWh (${(
                          (activeSummary.kwh ?? 0) - currentTarget
                        ).toFixed(1)} vs target)`
                      : 'Set a target to benchmark performance'
                  }
                  accentClass="text-amber-600"
                />
              </div>

              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/40 dark:bg-blue-900/20">
                <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                  Recommendations
                </h3>
                <div className="mt-3">
                  <Suggestions
                    overall={overallScore}
                    consumption={consumptionScore}
                    powerQuality={powerQualityScore}
                    target={currentTarget}
                  />
                </div>
              </div>

              {data?.analysis_window && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm dark:border-gray-700 dark:bg-gray-800/40">
                  <div className="flex flex-wrap gap-4 text-gray-700 dark:text-gray-200">
                    <span>
                      <strong>From:</strong>{' '}
                      {new Date(data.analysis_window.start).toLocaleString()}
                    </span>
                    <span>
                      <strong>To:</strong>{' '}
                      {new Date(data.analysis_window.end).toLocaleString()}
                    </span>
                    <span>
                      <strong>Focus device:</strong>{' '}
                      {primaryDevice?.id ?? 'All devices'}
                    </span>
                  </div>
                </div>
              )}

              <DataTable
                title="Daily Energy Summary"
                description="Daily totals and day-over-day changes."
                headers={['Device', 'Date', 'kWh', 'Prev Day', 'Δ kWh', 'Δ %']}
                rows={dailyRows}
                emptyMessage="No daily summary available."
              />

              <DataTable
                title="Hourly Comparison (latest vs previous day)"
                description="Latest 24-hour consumption compared to the previous day."
                headers={['Device', 'Hour', 'Current kWh', 'Previous kWh', 'Δ kWh', 'Δ %']}
                rows={hourlyRows}
                emptyMessage="No hourly comparison available."
              />

              {trendRows.length > 0 && (
                <DataTable
                  title="7-Day Trend"
                  headers={['Device', 'Date', 'kWh']}
                  rows={trendRows}
                  emptyMessage="No trend data."
                />
              )}

              {anomalyRows.length > 0 && (
                <DataTable
                  title="Anomaly Detection (|z| ≥ 2)"
                  headers={['Device', 'Date', 'kWh', 'Z-score']}
                  rows={anomalyRows}
                  emptyMessage="No anomalies detected."
                />
              )}
            </>
          )}
        </div>
      )}

        {activeTab === 'devices' && <DeviceComparison timeRange={timeRange} />}

        {activeTab === 'shifts' && <ShiftAnalysis timeRange={timeRange} />}

      {activeTab === 'trends' && (
        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-300">
          Advanced trend visualisations are coming soon.
        </div>
      )}

      {activeTab === 'costs' && (
        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-300">
          Cost analytics are in development.
      </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:border-blue-800 dark:bg-blue-950/30">
        <div className="flex items-start">
          <svg
            className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500 dark:text-blue-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="font-medium text-blue-800 dark:text-blue-200">
              Analytics Data Source
            </p>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-100">
              Data is aggregated from real-time measurements stored in InfluxDB,
              processed via the Django analytics service, and refreshed on
              demand with each query.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
