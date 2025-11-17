// app/single-line/page.tsx
'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  MarkerType,
  Handle,
  Position,
  NodeProps,
  useNodesState,
  useEdgesState,
} from 'reactflow'
import 'reactflow/dist/style.css'

interface DevicePowerData {
  id: number
  name: string
  location: string
  power_value: number | null
  unit: string
  last_update: string | null
  is_online: boolean
  error?: string
  parent_device_id?: number | null
  parent_device_name?: string | null
}

interface RealtimePowerResponse {
  devices: DevicePowerData[]
  timestamp: string
  error?: string
}

const DeviceNode = ({ data }: NodeProps<{ device: DevicePowerData }>) => {
  const device = data.device
  return (
    <div
      className={`w-56 border-2 rounded-2xl px-4 py-3 shadow-md transition-all ${
        device.is_online
          ? 'bg-white dark:bg-gray-800 border-green-500 dark:border-green-600'
          : 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 opacity-60'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-blue-500" />
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-gray-900 dark:text-white truncate">{device.name}</div>
        <div
          className={`w-3 h-3 rounded-full ${
            device.is_online ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`}
        ></div>
      </div>
      {device.location && (
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2 truncate">
          📍 {device.location}
        </p>
      )}
      <div className="text-center">
        {device.power_value !== null ? (
          <>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-300">
              {device.power_value.toFixed(2)}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{device.unit}</p>
          </>
        ) : (
          <p className="text-base text-gray-400 dark:text-gray-500">No Data</p>
        )}
      </div>
      {device.last_update && (
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 text-center">
          Updated {new Date(device.last_update).toLocaleTimeString()}
        </p>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
    </div>
  )
}

const BusNode = ({ data }: NodeProps<{ totalPower: number }>) => (
  <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-3xl shadow-xl min-w-[220px] text-center">
    <Handle type="source" position={Position.Bottom} className="!bg-white" />
    <p className="text-sm uppercase tracking-widest opacity-80">Main Bus</p>
    <p className="text-4xl font-bold mt-1">{data.totalPower.toFixed(2)} kW</p>
    <p className="text-xs opacity-80 mt-1">Live aggregate load</p>
  </div>
)

export default function SingleLineDiagramPage() {
  const [deviceData, setDeviceData] = useState<DevicePowerData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [showConfig, setShowConfig] = useState(false)

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [hasManualLayout, setHasManualLayout] = useState(false)
  const [manualPositions, setManualPositions] = useState<Record<string, { x: number; y: number }>>({})

  const fetchPowerData = useCallback(async () => {
    try {
      const response = await fetch('/api/modbus/realtime/power/')
      if (!response.ok) {
        throw new Error(`Failed to fetch power data: ${response.status}`)
      }
      const data: RealtimePowerResponse = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }
      setDeviceData(data.devices || [])
      setLastUpdate(new Date(data.timestamp))
      setError(null)
    } catch (err) {
      console.error('Error fetching power data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch power data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPowerData()
    const interval = setInterval(fetchPowerData, 5000)
    return () => clearInterval(interval)
  }, [fetchPowerData])

  const totalPower = deviceData.reduce((sum, device) => sum + (device.power_value || 0), 0)
  const onlineDevices = deviceData.filter((d) => d.is_online).length

  // Build hierarchical layout based on parent relationships
  const generateNodes = useCallback((): Node[] => {
    const baseNodes: Node[] = [
      {
        id: 'bus',
        type: 'busNode',
        position: { x: 0, y: 0 },
        data: { totalPower },
      },
    ]

    // Separate devices by hierarchy level
    const rootDevices = deviceData.filter((d) => !d.parent_device_id)
    const childDevices = deviceData.filter((d) => d.parent_device_id)

    // Position root devices (connected to bus)
    const horizontalSpacing = 280
    const verticalSpacing = 180
    const rootNodes: Node[] = rootDevices.map((device, index) => {
      const x = (index - (rootDevices.length - 1) / 2) * horizontalSpacing
      return {
        id: `device-${device.id}`,
        type: 'deviceNode',
        position: { x, y: verticalSpacing },
        data: { device },
      } satisfies Node
    })

    // Position child devices (connected to parent devices)
    const childNodes: Node[] = []
    const childVerticalSpacing = 180
    const childHorizontalSpacing = 200

    // Group children by parent
    const childrenByParent = new Map<number, DevicePowerData[]>()
    childDevices.forEach((device) => {
      if (device.parent_device_id) {
        const parentId = device.parent_device_id
        if (!childrenByParent.has(parentId)) {
          childrenByParent.set(parentId, [])
        }
        childrenByParent.get(parentId)!.push(device)
      }
    })

    // Position children relative to their parents
    childrenByParent.forEach((children, parentId) => {
      const parentNode = [...rootNodes, ...childNodes].find((n) => n.id === `device-${parentId}`)
      if (parentNode) {
        children.forEach((device, index) => {
          const offsetX = (index - (children.length - 1) / 2) * childHorizontalSpacing
          childNodes.push({
            id: `device-${device.id}`,
            type: 'deviceNode',
            position: {
              x: parentNode.position.x + offsetX,
              y: parentNode.position.y + childVerticalSpacing,
            },
            data: { device },
          } satisfies Node)
        })
      }
    })

    return [...baseNodes, ...rootNodes, ...childNodes].map((node) => ({
      ...node,
      draggable: node.id !== 'bus',
    }))
  }, [deviceData, totalPower])

  const generateEdges = useCallback((): Edge[] => {
    const edgeList: Edge[] = []

    deviceData.forEach((device) => {
      if (device.parent_device_id) {
        // Connect to parent device
        edgeList.push({
          id: `edge-${device.parent_device_id}-${device.id}`,
          source: `device-${device.parent_device_id}`,
          target: `device-${device.id}`,
          animated: true,
          style: { stroke: '#10b981', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#10b981' },
        })
      } else {
        // Connect to main bus
        edgeList.push({
          id: `edge-bus-${device.id}`,
          source: 'bus',
          target: `device-${device.id}`,
          animated: true,
          style: { stroke: '#3b82f6', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#3b82f6' },
        })
      }
    })

    return edgeList
  }, [deviceData])

  useEffect(() => {
    const newNodes = generateNodes().map((node) => {
      if (manualPositions[node.id]) {
        return { ...node, position: manualPositions[node.id] }
      }
      return node
    })

    setNodes(newNodes)
    setEdges(generateEdges())
  }, [generateNodes, generateEdges, setNodes, setEdges, manualPositions])

  const nodeTypes = useMemo(
    () => ({
      deviceNode: DeviceNode,
      busNode: BusNode,
    }),
    []
  )

  const totalDevices = deviceData.length

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Single Line Diagram</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Interactive hierarchical view with configurable device relationships.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {lastUpdate && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
          <button
            onClick={() => {
              setHasManualLayout(false)
              setManualPositions({})
              setNodes(generateNodes())
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Auto Arrange
          </button>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            {showConfig ? 'Hide Config' : 'Configure'}
          </button>
          <button
            onClick={fetchPowerData}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Configuration Panel */}
      {showConfig && (
        <DeviceRelationshipConfig
          devices={deviceData}
          onClose={() => setShowConfig(false)}
          onUpdate={fetchPowerData}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Power"
          value={`${totalPower.toFixed(2)} kW`}
          subtitle="Live aggregate load"
          variant="blue"
        />
        <StatCard
          title="Online Devices"
          value={`${onlineDevices} / ${totalDevices}`}
          subtitle="Devices reporting active power"
          variant="green"
        />
        <StatCard title="Update Interval" value="5s" subtitle="Auto-refresh cadence" variant="purple" />
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          Error: {error}
        </div>
      )}

      {isLoading && deviceData.length === 0 ? (
        <div className="flex items-center justify-center h-[600px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading device data...</p>
          </div>
        </div>
      ) : deviceData.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No active devices</h3>
            <p className="text-gray-500">Add devices in the Modbus section to visualize them here.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 lg:p-6 shadow-lg">
          <div className="h-[600px]">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={(changes) => {
                const updatedPositions: Record<string, { x: number; y: number }> = {}
                changes.forEach((change) => {
                  if (change.type === 'position' && change.position) {
                    updatedPositions[change.id] = change.position
                  }
                })
                if (Object.keys(updatedPositions).length > 0) {
                  setHasManualLayout(true)
                  setManualPositions((prev) => ({
                    ...prev,
                    ...updatedPositions,
                  }))
                }
                onNodesChange(changes)
              }}
              onEdgesChange={onEdgesChange}
              fitView
              fitViewOptions={{ padding: 0.4 }}
              minZoom={0.5}
            >
              <MiniMap pannable zoomable className="!bg-white/70 dark:!bg-gray-900/70" />
              <Controls className="bg-white/90 dark:bg-gray-900/80 shadow" />
              <Background gap={24} size={1} color="#e5e7eb" />
            </ReactFlow>
          </div>
        </div>
      )}
    </div>
  )
}

// Device Relationship Configuration Component
function DeviceRelationshipConfig({
  devices,
  onClose,
  onUpdate,
}: {
  devices: DevicePowerData[]
  onClose: () => void
  onUpdate: () => void
}) {
  const [relationships, setRelationships] = useState<Record<number, number | null>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Initialize relationships from device data
    const rels: Record<number, number | null> = {}
    devices.forEach((device) => {
      rels[device.id] = device.parent_device_id || null
    })
    setRelationships(rels)
  }, [devices])

  const handleParentChange = (deviceId: number, parentId: number | null) => {
    setRelationships((prev) => ({
      ...prev,
      [deviceId]: parentId,
    }))
  }

  const saveRelationships = async () => {
    setIsSaving(true)
    try {
      // Update each device's parent relationship
      const updates = Object.entries(relationships).map(async ([deviceId, parentId]) => {
        const response = await fetch(`/api/modbus/devices/${deviceId}/set_parent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            parent_device_id: parentId,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || `Failed to update device ${deviceId}`)
        }

        return response.json()
      })

      await Promise.all(updates)
      alert('Device relationships saved successfully!')
      onUpdate()
      onClose()
    } catch (error) {
      console.error('Error saving relationships:', error)
      alert(`Failed to save relationships: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Configure Device Relationships</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Set parent devices to create hierarchical connections in the single-line diagram.
      </p>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {devices.map((device) => (
          <div key={device.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded">
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-white">{device.name}</div>
              {device.location && (
                <div className="text-xs text-gray-500 dark:text-gray-400">{device.location}</div>
              )}
            </div>
            <select
              value={relationships[device.id] || ''}
              onChange={(e) => handleParentChange(device.id, e.target.value ? parseInt(e.target.value) : null)}
              className="ml-4 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">None (Root Device)</option>
              {devices
                .filter((d) => d.id !== device.id)
                .map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.name}
                  </option>
                ))}
            </select>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          onClick={saveRelationships}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Relationships'}
        </button>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  subtitle: string
  variant: 'blue' | 'green' | 'purple'
}

const StatCard = ({ title, value, subtitle, variant }: StatCardProps) => {
  const palette = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-300',
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-700 dark:text-green-300',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-800',
      text: 'text-purple-700 dark:text-purple-300',
    },
  }[variant]

  return (
    <div className={`p-4 rounded-2xl border ${palette.bg} ${palette.border}`}>
      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{title}</p>
      <p className={`text-3xl font-bold mt-2 ${palette.text}`}>{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{subtitle}</p>
    </div>
  )
}
