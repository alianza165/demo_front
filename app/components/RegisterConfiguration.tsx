'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Button from './ui/Button'
import Input from './ui/Input'

interface ModbusRegister {
  id?: number
  address: number
  name: string
  data_type: string
  scale_factor: number
  unit: string
  order: number
  category?: string
  visualization_type?: string
}

interface RegisterConfigurationProps {
  registers: ModbusRegister[]
  onRegistersChange: (registers: ModbusRegister[]) => void
  disabled?: boolean
  isPreconfigured?: boolean
  preconfiguredRegisters?: ModbusRegister[]
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
  disabled = false,
  isPreconfigured = false,
  preconfiguredRegisters = []
}: RegisterConfigurationProps) {
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const { register, handleSubmit, reset, formState: { errors } } = useForm<RegisterForm>()

  // Group preconfigured registers by category for the reference section
  const preconfiguredByCategory = preconfiguredRegisters.reduce((acc, register) => {
    const category = register.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(register);
    return acc;
  }, {} as { [key: string]: ModbusRegister[] });

  // Check if a preconfigured register is already in the configured list
  const isRegisterInConfigured = (register: ModbusRegister) => {
    return registers.some(reg => 
      reg.address === register.address && reg.name === register.name
    );
  };

  // Add a preconfigured register to the configured list
  const addPreconfiguredRegister = (template: ModbusRegister) => {
    if (isRegisterInConfigured(template)) {
      alert('This register is already configured');
      return;
    }

    const newRegister: ModbusRegister = {
      ...template,
      order: registers.length
    };
    
    onRegistersChange([...registers, newRegister]);
  };

  // Add custom register
  const addCustomRegister = (data: RegisterForm) => {
    const newRegister: ModbusRegister = {
      ...data,
      order: registers.length
    };
    
    // Check if register already exists
    const exists = registers.some(reg => 
      reg.address === data.address || reg.name === data.name
    );
    
    if (exists) {
      alert('A register with this address or name already exists');
      return;
    }
    
    onRegistersChange([...registers, newRegister]);
    reset();
    setShowCustomForm(false);
  };

  const removeRegister = (index: number) => {
    console.log('Attempting to remove register at index:', index);
    console.log('Current registers:', registers);
    
    if (index < 0 || index >= registers.length) {
      console.error('Invalid index:', index);
      return;
    }
    
    const newRegisters = registers.filter((_, i) => i !== index)
      .map((reg, i) => ({ ...reg, order: i }));
    
    console.log('New registers after removal:', newRegisters);
    
    onRegistersChange(newRegisters);
  };


return (
    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Register Configuration</h3>

      {/* Preconfigured Registers Reference Section */}
      {isPreconfigured && preconfiguredRegisters.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300">Available Preconfigured Registers</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            These registers are available for your selected device model. 
            Click on any register to add it to your configuration.
          </p>

          {/* Category Tabs - Simple Implementation */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-1 border-b border-gray-200 dark:border-gray-700">
              {Object.keys(preconfiguredByCategory).map((category, index) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(index === 0 && !selectedCategory ? category : category)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                    (selectedCategory === category || (index === 0 && !selectedCategory))
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {category.replace('_', ' ')} ({preconfiguredByCategory[category].length})
                </button>
              ))}
            </div>
          </div>

          {/* Register Grid for Selected Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {preconfiguredByCategory[selectedCategory || Object.keys(preconfiguredByCategory)[0]]?.map((register) => {
              const isAdded = registers.some(reg => reg.address === register.address && reg.name === register.name);
              return (
                <div
                  key={`preconfigured-${register.address}-${register.name}`}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    isAdded 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 shadow-sm' 
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md'
                  }`}
                    onClick={(e) => {
                      e.preventDefault(); // Add this
                      !isAdded && onRegistersChange([...registers, { ...register, order: registers.length }])
                    }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h6 className="font-medium text-gray-900 dark:text-white text-sm">
                          {register.name}
                        </h6>
                        {isAdded ? (
                          <span className="text-green-600 dark:text-green-400 text-xs font-medium bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                            Added
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-1"
                            title="Add register"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        )}
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-mono">0x{register.address.toString(16).toUpperCase()}</span>
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {register.data_type} ×{register.scale_factor}
                          {register.unit && <span className="ml-1">[{register.unit}]</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom Register Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium text-gray-700 dark:text-gray-300">
            {isPreconfigured ? 'Your Configuration' : 'Custom Register Configuration'}
          </h4>
          
          {!isPreconfigured && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCustomForm(!showCustomForm)}
              size="sm"
              disabled={disabled}
            >
              {showCustomForm ? 'Cancel' : 'Add Custom Register'}
            </Button>
          )}
        </div>

        {isPreconfigured && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Your current register configuration. You can remove registers or add them back from the available list above.
          </p>
        )}

        {/* Custom Register Form */}
        {!isPreconfigured && showCustomForm && (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4 border border-gray-200 dark:border-gray-700">
            <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300">Custom Register</h4>
            <form onSubmit={handleSubmit((data) => {
              const newRegister = { ...data, order: registers.length };
              if (!registers.some(reg => reg.address === data.address || reg.name === data.name)) {
                onRegistersChange([...registers, newRegister]);
                reset();
                setShowCustomForm(false);
              } else {
                alert('A register with this address or name already exists');
              }
            })} className="space-y-4">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data Type
                  </label>
                  <select
                    {...register('data_type', { required: 'Data type is required' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
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
      </div>

      {/* Configured Registers List */}
      {registers.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">
            Configured Registers ({registers.length})
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {registers.map((register, index) => (
              <div 
                key={`configured-${register.address}-${register.name}-${index}`} 
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded"
              >
                <div className="flex items-center space-x-4">
                  <span className="font-medium text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                    {index + 1}
                  </span>
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">{register.name}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                      (Addr: 0x{register.address.toString(16).toUpperCase()}, {register.data_type})
                    </span>
                    {register.unit && (
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">[{register.unit}]</span>
                    )}
                    {register.scale_factor !== 1 && (
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">×{register.scale_factor}</span>
                    )}
                    {register.category && (
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 ml-2 px-2 py-1 rounded capitalize">
                        {register.category.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onRegistersChange(registers.filter((_, i) => i !== index).map((reg, i) => ({ ...reg, order: i })));
                  }}
                  className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1 disabled:opacity-50 ml-4 transition-colors"
                  title="Remove register"
                  disabled={disabled}
                  style={{ minWidth: '30px', minHeight: '30px' }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {registers.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <p>No registers configured yet.</p>
          <p className="text-sm mt-1">
            {isPreconfigured 
              ? 'Select registers from the available list above.' 
              : 'Click "Add Custom Register" to get started.'
            }
          </p>
        </div>
      )}
    </div>
  )
}
