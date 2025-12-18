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
  process_area?: string;
  floor?: string;
  load_type?: string;
  device_type?: string;
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
      // Fetch all devices by paginating through all pages
      let allDevices: ModbusDevice[] = [];
      let currentPage = 1;
      let hasMore = true;
      
      while (hasMore) {
        const query = new URLSearchParams({ 
          page: currentPage.toString(),
          ordering: 'name'
        });
        const response = await fetch(`/api/modbus/devices?${query.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch devices: ${response.status}`);
        }
        
        const data = await response.json();
        const pageDevices = data.results || [];
        allDevices = [...allDevices, ...pageDevices];
        
        // Check if there are more pages
        hasMore = data.next !== null && data.next !== undefined && pageDevices.length > 0;
        currentPage++;
      }
      
      setDevices(allDevices);
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
        console.log('=== FRONTEND UPDATE REQUEST ===');
        console.log('URL:', `/api/modbus/devices/${id}`);
        console.log('Device ID:', id);
        console.log('Full payload:', JSON.stringify(deviceData, null, 2));
        
        // Log registers specifically
        console.log('Registers array:', deviceData.registers);
        console.log('Registers length:', deviceData.registers?.length);
        if (deviceData.registers) {
          deviceData.registers.forEach((reg: any, index: number) => {
            console.log(`Register ${index}:`, reg);
          });
        }

        const response = await fetch(`/api/modbus/devices/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(deviceData),
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.log('Error response:', errorData);
          throw new Error(errorData.error || `Failed to update device: ${response.status}`);
        }

        const data = await response.json();
        await fetchDevices();
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
