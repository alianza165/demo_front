// hooks/useModbusDevices.js
import { useState, useEffect } from 'react';
import { modbusAPI } from '../services/api';

export const useModbusDevices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDevices = async () => {
    setLoading(true);
    setError(null);
    
    const result = await modbusAPI.getDevices();
    
    if (result.success) {
      setDevices(result.data);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const createDevice = async (deviceData) => {
    setError(null);
    const result = await modbusAPI.createDevice(deviceData);
    
    if (result.success) {
      await fetchDevices(); // Refresh the list
      return { success: true, data: result.data };
    } else {
      setError(result.error);
      return { success: false, error: result.error };
    }
  };

  const updateDevice = async (id, deviceData) => {
    setError(null);
    const result = await modbusAPI.updateDevice(id, deviceData);
    
    if (result.success) {
      await fetchDevices(); // Refresh the list
      return { success: true, data: result.data };
    } else {
      setError(result.error);
      return { success: false, error: result.error };
    }
  };

  const deleteDevice = async (id) => {
    setError(null);
    const result = await modbusAPI.deleteDevice(id);
    
    if (result.success) {
      await fetchDevices(); // Refresh the list
      return { success: true };
    } else {
      setError(result.error);
      return { success: false, error: result.error };
    }
  };

  const applyConfiguration = async (id) => {
    setError(null);
    const result = await modbusAPI.applyConfiguration(id);
    
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      setError(result.error);
      return { success: false, error: result.error };
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
