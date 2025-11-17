'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import analyticsService, {
  EnergyAnalyticsFilters,
  EnergyAnalyticsResponse,
} from '../services/analytics'

interface AnalyticsHookState {
  data: EnergyAnalyticsResponse | null
  loading: boolean
  error: string | null
  refresh: (filters?: Partial<EnergyAnalyticsFilters>) => Promise<void>
  downloadCsv: (section?: 'hourly' | 'daily' | 'summary' | 'all') => void
}

const DEFAULT_FILTERS: EnergyAnalyticsFilters = {
  days: 8,
  includeHourly: true,
  includeTrend: true,
}

export function useEnergyAnalytics(
  initialFilters: EnergyAnalyticsFilters = {}
): AnalyticsHookState {
  const [filters, setFilters] = useState<EnergyAnalyticsFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  })
  const [data, setData] = useState<EnergyAnalyticsResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(
    async (override?: Partial<EnergyAnalyticsFilters>) => {
      const nextFilters = { ...filters, ...override }
      setFilters(nextFilters)
      setLoading(true)
      setError(null)

      try {
        const response = await analyticsService.getEnergySummary(nextFilters)
        setData(response)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    },
    [filters]
  )

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const downloadCsv = useCallback(
    (section: 'hourly' | 'daily' | 'summary' | 'all' = 'all') => {
      const url = analyticsService.getReportUrl({ ...filters, section })
      if (typeof window !== 'undefined') {
        window.open(url, '_blank')
      }
    },
    [filters]
  )

  return useMemo(
    () => ({
      data,
      loading,
      error,
      refresh: fetchData,
      downloadCsv,
    }),
    [data, loading, error, fetchData, downloadCsv]
  )
}

export default useEnergyAnalytics



