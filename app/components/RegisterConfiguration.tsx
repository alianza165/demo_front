'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Button from './ui/Button'
import Input from './ui/Input'

interface RegisterTemplate {
  id: number
  name: string
  address: number
  data_type: string
  scale_factor: number
  unit: string
  description: string
  category: string
}

interface ModbusRegister {
  id?: number
  address: number
  name: string
  data_type: string
  scale_factor: number
  unit: string
  order: number
}

interface RegisterConfigurationProps {
  registers: ModbusRegister[]
  onRegistersChange: (registers: ModbusRegister[]) => void
  disabled?: boolean
}

interface RegisterForm {
  address: number
  name: string
  data_type: string
  scale_factor: number
  unit: string
}

export default function RegisterConfiguration({ 
  registers, 
  onRegistersChange, 
  disabled = false 
}: RegisterConfigurationProps) {
  const [templates, setTemplates] = useState<{[key: string]: RegisterTemplate[]}>({})
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RegisterForm>()

  // Load predefined templates
  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/modbus/register-templates/by_category/')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
        // Set first category as default
        const firstCategory = Object.keys(data)[0]
        if (firstCategory) setSelectedCategory(firstCategory)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTemplateRegister = (template: RegisterTemplate) => {
    const newRegister: ModbusRegister = {
      address: template.address,
      name: template.name,
      data_type: template.data_type,
      scale_factor: template.scale_factor,
      unit: template.unit,
      order: registers.length
    }
    
    // Check if register already exists
    const exists = registers.some(reg => 
      reg.address === template.address || reg.name === template.name
    )
    
    if (exists) {
      alert('This register is already configured')
      return
    }
    
    onRegistersChange([...registers, newRegister])
  }

  const addCustomRegister = (data: RegisterForm) => {
    const newRegister: ModbusRegister = {
      ...data,
      order: registers.length
    }
    
    // Check if register already exists
    const exists = registers.some(reg => 
      reg.address === data.address || reg.name === data.name
    )
    
    if (exists) {
      alert('A register with this address or name already exists')
      return
    }
    
    onRegistersChange([...registers, newRegister])
    reset()
    setShowCustomForm(false)
  }

  const removeRegister = (index: number) => {
    const newRegisters = registers.filter((_, i) => i !== index)
      .map((reg, i) => ({ ...reg, order: i }))
    onRegistersChange(newRegisters)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="pt-4 border-t">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">Register Configuration</h3>

      {/* Predefined Templates */}
      <div className="mb-6">
        <h4 className="font-medium mb-3 text-gray-700">Predefined Registers</h4>
        
        {/* Category Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Category
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(templates).map(category => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-2 rounded-md text-sm font-medium capitalize ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Template Grid */}
        {selectedCategory && templates[selectedCategory] && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {templates[selectedCategory].map(template => (
              <div
                key={template.id}
                className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => addTemplateRegister(template)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium text-gray-900">{template.name}</h5>
                    <p className="text-sm text-gray-600">Address: 0x{template.address.toString(16).toUpperCase()}</p>
                    <p className="text-sm text-gray-600">
                      {template.data_type} ×{template.scale_factor} {template.unit && `[${template.unit}]`}
                    </p>
                    {template.description && (
                      <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    className="text-green-500 hover:text-green-700"
                    title="Add register"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Custom Register Toggle */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Can't find what you need?
          </span>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowCustomForm(!showCustomForm)}
            size="sm"
          >
            {showCustomForm ? 'Cancel Custom' : 'Add Custom Register'}
          </Button>
        </div>
      </div>

      {/* Custom Register Form */}
      {showCustomForm && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h4 className="font-medium mb-3 text-gray-700">Custom Register</h4>
          <form onSubmit={handleSubmit(addCustomRegister)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Input
                label="Register Address"
                type="number"
                {...register('address', { 
                  required: 'Address is required',
                  min: { value: 0, message: 'Address must be positive' }
                })}
                error={errors.address?.message}
                disabled={disabled}
              />
              
              <Input
                label="Register Name"
                {...register('name', { required: 'Name is required' })}
                error={errors.name?.message}
                disabled={disabled}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Type
                </label>
                <select
                  {...register('data_type', { required: 'Data type is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  disabled={disabled}
                >
                  <option value="uint16">Unsigned 16-bit</option>
                  <option value="int16">Signed 16-bit</option>
                  <option value="uint32">Unsigned 32-bit</option>
                  <option value="int32">Signed 32-bit</option>
                  <option value="float32">Float 32-bit</option>
                </select>
              </div>
              
              <Input
                label="Scale Factor"
                type="number"
                step="0.001"
                defaultValue={1}
                {...register('scale_factor')}
                disabled={disabled}
              />
              
              <Input
                label="Unit"
                {...register('unit')}
                placeholder="V, A, kW, etc."
                disabled={disabled}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowCustomForm(false)}
                disabled={disabled}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={disabled}>
                Add Register
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Configured Registers List */}
      {registers.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold mb-3 text-gray-700">
            Configured Registers ({registers.length})
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {registers.map((register, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white border rounded">
                <div className="flex items-center space-x-4">
                  <span className="font-medium text-sm bg-blue-100 px-2 py-1 rounded">
                    {index + 1}
                  </span>
                  <div>
                    <span className="font-medium">{register.name}</span>
                    <span className="text-sm text-gray-600 ml-2">
                      (Addr: 0x{register.address.toString(16).toUpperCase()}, {register.data_type})
                    </span>
                    {register.unit && (
                      <span className="text-sm text-gray-600 ml-2">[{register.unit}]</span>
                    )}
                    {register.scale_factor !== 1 && (
                      <span className="text-sm text-gray-600 ml-2">×{register.scale_factor}</span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeRegister(index)}
                  className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50"
                  title="Remove register"
                  disabled={disabled}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
