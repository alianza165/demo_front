'use client'

import { useState, useRef, useEffect } from 'react'
import { X, ChevronDown, Search, Check } from 'lucide-react'
import type { ModbusDevice } from '../../hooks/useModbusDevices'

interface DeviceMultiSelectProps {
  devices: ModbusDevice[]
  selectedDevices: number[]
  onChange: (deviceIds: number[]) => void
  placeholder?: string
}

export default function DeviceMultiSelect({
  devices,
  selectedDevices,
  onChange,
  placeholder = 'Select devices...',
}: DeviceMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter devices based on search term
  const filteredDevices = devices.filter(device =>
    device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.process_area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.floor?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get selected device objects
  const selectedDeviceObjects = devices.filter(d => selectedDevices.includes(d.id))

  // Toggle device selection
  const toggleDevice = (deviceId: number) => {
    if (selectedDevices.includes(deviceId)) {
      onChange(selectedDevices.filter(id => id !== deviceId))
    } else {
      onChange([...selectedDevices, deviceId])
    }
  }

  // Select all filtered devices
  const selectAll = () => {
    const filteredIds = filteredDevices.map(d => d.id)
    const newSelection = [...new Set([...selectedDevices, ...filteredIds])]
    onChange(newSelection)
  }

  // Deselect all filtered devices
  const deselectAll = () => {
    const filteredIds = filteredDevices.map(d => d.id)
    onChange(selectedDevices.filter(id => !filteredIds.includes(id)))
  }

  // Clear all selections
  const clearAll = () => {
    onChange([])
  }

  // Group devices by process area for better organization
  const groupedDevices = filteredDevices.reduce((acc, device) => {
    const key = device.process_area || 'Other'
    if (!acc[key]) acc[key] = []
    acc[key].push(device)
    return acc
  }, {} as Record<string, ModbusDevice[]>)

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected devices display */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[42px] w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 cursor-pointer focus:ring-2 focus:ring-blue-500 flex items-center justify-between gap-2"
      >
        <div className="flex-1 flex flex-wrap gap-1 min-h-[24px]">
          {selectedDeviceObjects.length === 0 ? (
            <span className="text-gray-500 dark:text-gray-400 text-sm">{placeholder}</span>
          ) : (
            selectedDeviceObjects.slice(0, 3).map(device => (
              <span
                key={device.id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-medium"
              >
                {device.name.length > 20 ? device.name.substring(0, 20) + '...' : device.name}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleDevice(device.id)
                  }}
                  className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
          {selectedDeviceObjects.length > 3 && (
            <span className="text-xs text-gray-600 dark:text-gray-400 px-2 py-1">
              +{selectedDeviceObjects.length - 3} more
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedDevices.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                clearAll()
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-96 overflow-hidden flex flex-col">
          {/* Search bar */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search devices..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  selectAll()
                }}
                className="text-xs px-2 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
              >
                Select All
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deselectAll()
                }}
                className="text-xs px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
              >
                Deselect All
              </button>
              {selectedDevices.length > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto py-1">
                  {selectedDevices.length} selected
                </span>
              )}
            </div>
          </div>

          {/* Device list */}
          <div className="overflow-y-auto flex-1">
            {filteredDevices.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                No devices found
              </div>
            ) : (
              Object.entries(groupedDevices).map(([processArea, areaDevices]) => (
                <div key={processArea} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900/50 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                    {processArea}
                  </div>
                  {(areaDevices as ModbusDevice[]).map((device: ModbusDevice) => {
                    const isSelected = selectedDevices.includes(device.id)
                    return (
                      <label
                        key={device.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleDevice(device.id)
                        }}
                        className="flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                      >
                        <div className="flex items-center flex-1">
                          <div className={`w-4 h-4 border-2 rounded mr-3 flex items-center justify-center ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {device.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {device.floor && `${device.floor} • `}
                              {device.load_type && device.load_type !== 'none' && device.load_type}
                            </div>
                          </div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
