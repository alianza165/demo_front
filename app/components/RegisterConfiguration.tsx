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
    <div className="pt-4 border-t">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">Register Configuration</h3>

      {/* Preconfigured Registers Reference Section */}
      {isPreconfigured && preconfiguredRegisters.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium mb-3 text-gray-700">Available Preconfigured Registers</h4>
          <p className="text-sm text-gray-600 mb-4">
            These registers are available for your selected device model. 
            Click on any register to add it to your configuration.
          </p>

          <div className="space-y-4">
            {Object.entries(preconfiguredByCategory).map(([category, categoryRegisters]) => (
              <div key={category} className="border rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3 capitalize">
                  {category.replace('_', ' ')} ({categoryRegisters.length})
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categoryRegisters.map((register) => {
                    const isAdded = isRegisterInConfigured(register);
                    return (
                      <div
                        key={`preconfigured-${register.address}-${register.name}`}
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                          isAdded 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-gray-50 hover:bg-blue-50 hover:border-blue-200'
                        }`}
                        onClick={() => !isAdded && addPreconfiguredRegister(register)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h6 className="font-medium text-gray-900">{register.name}</h6>
                            <p className="text-sm text-gray-600">
                              Address: 0x{register.address.toString(16).toUpperCase()}
                            </p>
                            <p className="text-sm text-gray-600">
                              {register.data_type} ×{register.scale_factor} 
                              {register.unit && ` [${register.unit}]`}
                            </p>
                          </div>
                          <div className="flex items-center">
                            {isAdded ? (
                              <span className="text-green-600 text-sm font-medium">✓ Added</span>
                            ) : (
                              <button
                                type="button"
                                className="text-blue-500 hover:text-blue-700 p-1"
                                title="Add register"
                              >
                                +
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Register Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium text-gray-700">
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
          <p className="text-sm text-gray-600 mb-4">
            Your current register configuration. You can remove registers or add them back from the available list above.
          </p>
        )}

        {/* Custom Register Form */}
        {!isPreconfigured && showCustomForm && (
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
      </div>

{/* Configured Registers List */}
{registers.length > 0 && (
  <div className="mt-6">
    <h4 className="font-semibold mb-3 text-gray-700">
      Configured Registers ({registers.length})
    </h4>
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {registers.map((register, index) => (
        <div 
          key={`configured-${register.address}-${register.name}-${index}`} 
          className="flex items-center justify-between p-3 bg-white border rounded"
        >
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
              {register.category && (
                <span className="text-xs bg-gray-100 text-gray-600 ml-2 px-2 py-1 rounded capitalize">
                  {register.category.replace('_', ' ')}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation(); // Prevent event bubbling
              e.preventDefault(); // Prevent default behavior
              console.log('Remove button clicked for index:', index, 'register:', register);
              removeRegister(index);
            }}
            className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50 ml-4"
            title="Remove register"
            disabled={disabled}
            style={{ minWidth: '30px', minHeight: '30px' }} // Ensure clickable area
          >
            ×
          </button>
        </div>
      ))}
    </div>
  </div>
)}

      {registers.length === 0 && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
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
