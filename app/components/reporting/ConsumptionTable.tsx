'use client'

interface ConsumptionTableRow {
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

interface ConsumptionTableProps {
  data: ConsumptionTableRow[]
}

export default function ConsumptionTable({ data }: ConsumptionTableProps) {
  const getZoneColor = (value: number, process?: string) => {
    // Color coding based on thresholds
    if (!process) {
      // Overall kWh/G
      if (value > 100) return 'bg-red-100 dark:bg-red-900/30'
      if (value > 85) return 'bg-yellow-100 dark:bg-yellow-900/30'
      return 'bg-green-100 dark:bg-green-900/30'
    } else if (process === 'sewing') {
      if (value > 0.3) return 'bg-red-100 dark:bg-red-900/30'
      if (value > 0.2) return 'bg-yellow-100 dark:bg-yellow-900/30'
      return 'bg-green-100 dark:bg-green-900/30'
    } else if (process === 'finishing') {
      if (value > 0.12) return 'bg-red-100 dark:bg-red-900/30'
      if (value > 0.10) return 'bg-yellow-100 dark:bg-yellow-900/30'
      return 'bg-green-100 dark:bg-green-900/30'
    } else if (process === 'washing') {
      if (value > 0.45) return 'bg-red-100 dark:bg-red-900/30'
      if (value > 0.40) return 'bg-yellow-100 dark:bg-yellow-900/30'
      return 'bg-green-100 dark:bg-green-900/30'
    }
    return ''
  }

  const processes = ['denim', 'washing', 'finishing', 'sewing']

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        DND Consumption - kWh/Garments ({new Date().getFullYear()})
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left p-2 font-semibold text-gray-700 dark:text-gray-300">Month</th>
              <th colSpan={3} className="text-center p-2 font-semibold text-gray-700 dark:text-gray-300 border-l border-gray-200 dark:border-gray-700">
                DENIM & WASHING
              </th>
              <th className="text-center p-2 font-semibold text-gray-700 dark:text-gray-300 border-l border-gray-200 dark:border-gray-700">
                Sewing (kWh/G)
              </th>
              <th className="text-center p-2 font-semibold text-gray-700 dark:text-gray-300 border-l border-gray-200 dark:border-gray-700">
                Finishing (kWh/G)
              </th>
              <th className="text-center p-2 font-semibold text-gray-700 dark:text-gray-300 border-l border-gray-200 dark:border-gray-700">
                Washing (kWh/G)
              </th>
            </tr>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th></th>
              <th className="text-center p-2 text-xs text-gray-600 dark:text-gray-400">kWh Cons.</th>
              <th className="text-center p-2 text-xs text-gray-600 dark:text-gray-400">Garments</th>
              <th className="text-center p-2 text-xs text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                Overall kWh/G
              </th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td className="p-2 font-medium text-gray-900 dark:text-white">{row.month}</td>
                <td className="p-2 text-center text-gray-700 dark:text-gray-300">
                  {row.total_energy.toLocaleString()}
                </td>
                <td className="p-2 text-center text-gray-700 dark:text-gray-300">
                  {row.total_garments.toLocaleString()}
                </td>
                <td
                  className={`p-2 text-center font-semibold border-r border-gray-200 dark:border-gray-700 ${getZoneColor(row.overall_kwh_g)}`}
                >
                  {row.overall_kwh_g.toFixed(1)}
                </td>
                <td
                  className={`p-2 text-center font-semibold ${getZoneColor(row.processes.sewing?.kwh_g || 0, 'sewing')}`}
                >
                  {row.processes.sewing?.kwh_g.toFixed(2) || '-'}
                </td>
                <td
                  className={`p-2 text-center font-semibold ${getZoneColor(row.processes.finishing?.kwh_g || 0, 'finishing')}`}
                >
                  {row.processes.finishing?.kwh_g.toFixed(2) || '-'}
                </td>
                <td
                  className={`p-2 text-center font-semibold ${getZoneColor(row.processes.washing?.kwh_g || 0, 'washing')}`}
                >
                  {row.processes.washing?.kwh_g.toFixed(2) || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}



