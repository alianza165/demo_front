import { useState, useEffect } from 'react';

interface ModbusRegister {
  id: number;
  address: number;
  name: string;
  data_type: string;
  scale_factor: number;
  unit: string;
  order: number;
}

interface ModbusDevice {
  id: number;
  name: string;
  address: number;
  baud_rate: number;
  parity: string;
  stop_bits: number;
  byte_size: number;
  timeout: number;
  port: string;
  registers: ModbusRegister[];
  is_active?: boolean;
  location?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export const useModbusDevices = () => {
  const [devices, setDevices] = useState<ModbusDevice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/modbus/devices');
      if (!response.ok) {
        throw new Error(`Failed to fetch devices: ${response.status}`);
      }
      const data = await response.json();
      setDevices(data.results || []);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const createDevice = async (deviceData: any): Promise<ApiResponse> => {
    setError(null);
    try {
      const response = await fetch('/api/modbus/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deviceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create device: ${response.status}`);
      }

      const data = await response.json();
      await fetchDevices(); // Refresh the list
      return { success: true, data };
    } catch (error) {
      const errorMessage = (error as Error).message;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateDevice = async (id: number, deviceData: any): Promise<ApiResponse> => {
    setError(null);
    try {
      const response = await fetch(`/api/modbus/devices/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deviceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update device: ${response.status}`);
      }

      const data = await response.json();
      await fetchDevices(); // Refresh the list
      return { success: true, data };
    } catch (error) {
      const errorMessage = (error as Error).message;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const deleteDevice = async (id: number): Promise<ApiResponse> => {
    setError(null);
    try {
      const response = await fetch(`/api/modbus/devices/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete device: ${response.status}`);
      }

      await fetchDevices(); // Refresh the list
      return { success: true };
    } catch (error) {
      const errorMessage = (error as Error).message;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const applyConfiguration = async (id: number): Promise<ApiResponse> => {
    setError(null);
    try {
      const response = await fetch(`/api/modbus/devices/${id}/apply_configuration`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to apply configuration: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      const errorMessage = (error as Error).message;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  return {
    devices,
    loading,
    error,
    refetch: fetchDevices,
    createDevice,
    updateDevice,
    deleteDevice,
    applyConfiguration,
  };
};
