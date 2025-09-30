// hooks/useModbusDevices.js
import { useState, useEffect } from 'react';

export const useModbusDevices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDevices = async () => {
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
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createDevice = async (deviceData) => {
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
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const updateDevice = async (id, deviceData) => {
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
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const deleteDevice = async (id) => {
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
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const applyConfiguration = async (id) => {
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
      setError(error.message);
      return { success: false, error: error.message };
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
