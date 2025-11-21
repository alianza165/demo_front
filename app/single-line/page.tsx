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
import dagre from 'dagre'
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

// Professional Electrical Symbols
const CircuitBreakerSymbol = ({ isOpen, size = 32 }: { isOpen: boolean; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className="stroke-current" fill="none" strokeWidth="2.5">
    <line x1="16" y1="4" x2="16" y2="12" />
    <line x1="16" y1="20" x2="16" y2="28" />
    {isOpen ? (
      <line x1="16" y1="12" x2="16" y2="20" strokeDasharray="2,2" />
    ) : (
      <line x1="16" y1="12" x2="16" y2="20" />
    )}
    <circle cx="16" cy="16" r="6" />
  </svg>
)

const TransformerSymbol = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className="stroke-current" fill="none" strokeWidth="2.5">
    <circle cx="16" cy="10" r="5" />
    <circle cx="16" cy="22" r="5" />
    <line x1="16" y1="5" x2="16" y2="15" />
    <line x1="16" y1="17" x2="16" y2="27" />
  </svg>
)

const SwitchSymbol = ({ isOpen, size = 32 }: { isOpen: boolean; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className="stroke-current" fill="none" strokeWidth="2.5">
    <line x1="16" y1="4" x2="16" y2="12" />
    <line x1="16" y1="20" x2="16" y2="28" />
    {isOpen ? (
      <line x1="16" y1="12" x2="16" y2="20" strokeDasharray="2,2" />
    ) : (
      <>
        <line x1="16" y1="12" x2="24" y2="16" />
        <line x1="24" y1="16" x2="16" y2="20" />
      </>
    )}
  </svg>
)

const MotorSymbol = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className="stroke-current" fill="none" strokeWidth="2.5">
    <line x1="16" y1="4" x2="16" y2="10" />
    <circle cx="16" cy="20" r="8" />
    <line x1="16" y1="12" x2="16" y2="28" />
    <line x1="10" y1="16" x2="22" y2="16" />
  </svg>
)

const LoadSymbol = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className="stroke-current" fill="none" strokeWidth="2.5">
    <line x1="16" y1="4" x2="16" y2="14" />
    <rect x="8" y="14" width="16" height="14" rx="2" />
    <line x1="11" y1="18" x2="21" y2="18" />
    <line x1="11" y1="22" x2="21" y2="22" />
    <line x1="11" y1="26" x2="21" y2="26" />
  </svg>
)

const BusBarSymbol = ({ width = 200 }: { width?: number }) => (
  <svg width={width} height="12" viewBox={`0 0 ${width} 12`} className="stroke-current" fill="currentColor" strokeWidth="0">
    <rect x="0" y="4" width={width} height="4" />
    <rect x="0" y="3" width={width} height="6" fill="none" strokeWidth="1" className="stroke-blue-600" />
  </svg>
)

// Professional Device Node
const DeviceNode = ({ data }: NodeProps<{ device: DevicePowerData }>) => {
  const device = data.device
  const isOnline = device.is_online
  const power = device.power_value || 0
  
  const getDeviceSymbol = () => {
    const name = device.name.toLowerCase()
    const location = device.location?.toLowerCase() || ''
    
    if (name.includes('transformer') || location.includes('transformer') || location.includes('xfmr')) {
      return <TransformerSymbol size={36} />
    } else if (name.includes('breaker') || name.includes('cb') || name.includes('mccb') || location.includes('breaker')) {
      return <CircuitBreakerSymbol isOpen={!isOnline} size={36} />
    } else if (name.includes('switch') || name.includes('disconnect') || location.includes('switch')) {
      return <SwitchSymbol isOpen={!isOnline} size={36} />
    } else if (name.includes('motor') || location.includes('motor')) {
      return <MotorSymbol size={36} />
    } else {
      return <LoadSymbol size={36} />
    }
  }

  const getStatusColor = () => {
    if (!isOnline) return 'border-gray-400 bg-gray-50 dark:bg-gray-900'
    if (power > 0) return 'border-green-500 bg-green-50/50 dark:bg-green-900/20'
    return 'border-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
  }

  return (
    <div
      className={`relative border-2 rounded-lg px-3 py-2.5 shadow-xl transition-all ${getStatusColor()} dark:bg-opacity-30`}
      style={{ minWidth: '160px', maxWidth: '200px' }}
    >
      <Handle type="target" position={Position.Top} className="!w-4 !h-4 !bg-blue-600 !border-2 !border-white dark:!border-gray-800" />
      
      {/* Electrical Symbol */}
      <div className={`flex justify-center mb-2 ${isOnline ? 'text-blue-700 dark:text-blue-400' : 'text-gray-500'}`}>
        {getDeviceSymbol()}
      </div>
      
      {/* Device Name */}
      <div className="flex items-center justify-between mb-1">
        <div className="font-bold text-xs text-gray-900 dark:text-white truncate flex-1 leading-tight">
          {device.name}
        </div>
        <div
          className={`w-2.5 h-2.5 rounded-full ml-1.5 flex-shrink-0 ${
            isOnline ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50' : 'bg-red-500'
          }`}
        ></div>
      </div>
      
      {/* Location */}
      {device.location && (
        <p className="text-[9px] text-gray-600 dark:text-gray-400 mb-1.5 truncate font-medium">
          {device.location}
        </p>
      )}
      
      {/* Power Value with Visual Indicator */}
      <div className="text-center border-t border-gray-300 dark:border-gray-600 pt-1.5 mt-1.5">
        {device.power_value !== null ? (
          <>
            <div className="flex items-baseline justify-center gap-1">
              <p className={`text-2xl font-bold ${isOnline ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500'}`}>
                {device.power_value.toFixed(1)}
              </p>
              <p className="text-[10px] text-gray-600 dark:text-gray-400 font-semibold">{device.unit}</p>
            </div>
            {/* Power bar indicator */}
            <div className="mt-1.5 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${isOnline ? 'bg-gradient-to-r from-green-400 to-blue-500' : 'bg-gray-400'}`}
                style={{ width: `${Math.min((device.power_value / 100) * 100, 100)}%` }}
              />
            </div>
          </>
        ) : (
          <p className="text-xs text-gray-400 dark:text-gray-500">No Data</p>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="!w-4 !h-4 !bg-blue-600 !border-2 !border-white dark:!border-gray-800" />
    </div>
  )
}

// Professional Bus Node
const BusNode = ({ data }: NodeProps<{ totalPower: number; deviceCount: number }>) => (
  <div className="px-5 py-4 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white rounded-xl shadow-2xl min-w-[240px] text-center border-2 border-blue-400">
    <Handle type="source" position={Position.Bottom} className="!w-5 !h-5 !bg-white !border-2 !border-blue-600" />
    <div className="flex justify-center mb-2">
      <BusBarSymbol width={180} />
    </div>
    <p className="text-xs uppercase tracking-widest opacity-90 font-bold mb-1">Main Distribution Bus</p>
    <div className="flex items-baseline justify-center gap-2 mb-1">
      <p className="text-4xl font-bold">{data.totalPower.toFixed(1)}</p>
      <p className="text-lg font-semibold opacity-90">kW</p>
    </div>
    <div className="flex items-center justify-center gap-4 mt-2 pt-2 border-t border-blue-400/30">
      <div>
        <p className="text-[10px] opacity-75">Devices</p>
        <p className="text-sm font-bold">{data.deviceCount}</p>
      </div>
      <div className="w-px h-6 bg-blue-400/30"></div>
      <div>
        <p className="text-[10px] opacity-75">Status</p>
        <p className="text-sm font-bold text-green-300">● Live</p>
      </div>
    </div>
  </div>
)

// Improved layout function with better spacing
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({ 
    rankdir: direction,
    nodesep: 80,   // Horizontal spacing
    ranksep: 100,  // Vertical spacing
    marginx: 40,
    marginy: 40,
    align: 'UL',   // Align to upper left
  })

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { 
      width: node.width || 180, 
      height: node.height || 140 
    })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    return {
      ...node,
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      position: {
        x: nodeWithPosition.x - (node.width || 180) / 2,
        y: nodeWithPosition.y - (node.height || 140) / 2,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}

export default function SingleLineDiagramPage() {
  const [deviceData, setDeviceData] = useState<DevicePowerData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [showConfig, setShowConfig] = useState(false)

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

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

  // Build nodes and edges with improved layout
  const generateNodesAndEdges = useCallback((): { nodes: Node[]; edges: Edge[] } => {
    const baseNodes: Node[] = [
      {
        id: 'bus',
        type: 'busNode',
        position: { x: 0, y: 0 },
        data: { totalPower, deviceCount: deviceData.length },
        width: 240,
        height: 140,
      },
    ]

    const deviceNodes: Node[] = deviceData.map((device) => ({
      id: `device-${device.id}`,
      type: 'deviceNode',
      position: { x: 0, y: 0 },
      data: { device },
      width: 180,
      height: 160,
    }))

    const allNodes = [...baseNodes, ...deviceNodes]

    const edgeList: Edge[] = deviceData.map((device) => {
      const isOnline = device.is_online
      const edgeColor = isOnline ? '#10b981' : '#6b7280'
      const edgeWidth = device.parent_device_id ? 2.5 : 3
      
      if (device.parent_device_id) {
        return {
          id: `edge-${device.parent_device_id}-${device.id}`,
          source: `device-${device.parent_device_id}`,
          target: `device-${device.id}`,
          animated: isOnline,
          style: { 
            stroke: edgeColor, 
            strokeWidth: edgeWidth,
          },
          markerEnd: { 
            type: MarkerType.ArrowClosed, 
            width: 22, 
            height: 22, 
            color: edgeColor 
          },
        }
      } else {
        return {
          id: `edge-bus-${device.id}`,
          source: 'bus',
          target: `device-${device.id}`,
          animated: isOnline,
          style: { 
            stroke: edgeColor, 
            strokeWidth: edgeWidth,
          },
          markerEnd: { 
            type: MarkerType.ArrowClosed, 
            width: 26, 
            height: 26, 
            color: edgeColor 
          },
        }
      }
    })

    // Apply dagre layout
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(allNodes, edgeList)
    
    return { nodes: layoutedNodes, edges: layoutedEdges }
  }, [deviceData, totalPower])

  useEffect(() => {
    if (deviceData.length > 0) {
      const { nodes: newNodes, edges: newEdges } = generateNodesAndEdges()
      setNodes(newNodes.map(node => ({ ...node, draggable: node.id !== 'bus' })))
      setEdges(newEdges)
    }
  }, [generateNodesAndEdges, setNodes, setEdges])

  const nodeTypes = useMemo(
    () => ({
      deviceNode: DeviceNode,
      busNode: BusNode,
    }),
    []
  )

  const totalDevices = deviceData.length

  const handleAutoLayout = useCallback(() => {
    const { nodes: newNodes, edges: newEdges } = generateNodesAndEdges()
    setNodes(newNodes.map(node => ({ ...node, draggable: node.id !== 'bus' })))
    setEdges(newEdges)
  }, [generateNodesAndEdges, setNodes, setEdges])

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Single Line Diagram</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Professional electrical system diagram with real-time monitoring
          </p>
        </div>
        <div className="flex items-center space-x-4 flex-wrap">
          {lastUpdate && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
              Updated: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
          <button
            onClick={handleAutoLayout}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            ↻ Auto Layout
          </button>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            {showConfig ? '✕ Hide Config' : '⚙️ Configure'}
          </button>
          <button
            onClick={fetchPowerData}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
          >
            {isLoading ? '⟳ Refreshing...' : '↻ Refresh'}
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
          icon="⚡"
        />
        <StatCard
          title="Online Devices"
          value={`${onlineDevices} / ${totalDevices}`}
          subtitle="Active monitoring"
          variant="green"
          icon="✓"
        />
        <StatCard 
          title="Update Rate" 
          value="5s" 
          subtitle="Real-time refresh" 
          variant="purple"
          icon="⟳"
        />
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border-2 border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {isLoading && deviceData.length === 0 ? (
        <div className="flex items-center justify-center h-[750px] bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Loading electrical system data...</p>
          </div>
        </div>
      ) : deviceData.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No active devices</h3>
            <p className="text-gray-500">Add devices in the Modbus section to visualize them here.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-4 lg:p-6 shadow-xl">
          <div className="h-[750px] w-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
              fitViewOptions={{ padding: 0.15, maxZoom: 1.1 }}
              minZoom={0.25}
              maxZoom={2}
              defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
            >
              <MiniMap 
                pannable 
                zoomable 
                className="!bg-white/90 dark:!bg-gray-900/90 border-2 border-gray-300 dark:border-gray-700 shadow-lg" 
                nodeColor={(node) => {
                  if (node.id === 'bus') return '#2563eb'
                  const device = deviceData.find(d => `device-${d.id}` === node.id)
                  return device?.is_online ? '#10b981' : '#6b7280'
                }}
                maskColor="rgba(0, 0, 0, 0.1)"
              />
              <Controls 
                className="bg-white/95 dark:bg-gray-900/95 shadow-xl border border-gray-300 dark:border-gray-700" 
                showZoom={true}
                showFitView={true}
                showInteractive={false}
              />
              <Background 
                gap={24} 
                size={1.5} 
                color="#e5e7eb" 
                className="dark:opacity-20"
              />
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
    <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Configure Device Relationships</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none"
        >
          ✕
        </button>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Set parent devices to create hierarchical connections in the single-line diagram.
      </p>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {devices.map((device) => (
          <div key={device.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex-1">
              <div className="font-semibold text-gray-900 dark:text-white">{device.name}</div>
              {device.location && (
                <div className="text-xs text-gray-500 dark:text-gray-400">{device.location}</div>
              )}
            </div>
            <select
              value={relationships[device.id] || ''}
              onChange={(e) => handleParentChange(device.id, e.target.value ? parseInt(e.target.value) : null)}
              className="ml-4 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
        >
          Cancel
        </button>
        <button
          onClick={saveRelationships}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
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
  icon?: string
}

const StatCard = ({ title, value, subtitle, variant, icon }: StatCardProps) => {
  const palette = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-300',
      iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-700 dark:text-green-300',
      iconBg: 'bg-green-100 dark:bg-green-900/40',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-800',
      text: 'text-purple-700 dark:text-purple-300',
      iconBg: 'bg-purple-100 dark:bg-purple-900/40',
    },
  }[variant]

  return (
    <div className={`p-5 rounded-xl border-2 ${palette.bg} ${palette.border} shadow-lg`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs uppercase tracking-wide font-semibold text-gray-600 dark:text-gray-400">{title}</p>
        {icon && (
          <div className={`w-8 h-8 rounded-lg ${palette.iconBg} flex items-center justify-center text-lg`}>
            {icon}
          </div>
        )}
      </div>
      <p className={`text-3xl font-bold mt-1 ${palette.text}`}>{value}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{subtitle}</p>
    </div>
  )
}
