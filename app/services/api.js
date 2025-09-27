// services/api.js
const API_BASE = 'http://localhost:8000/api'; // Update with your Django server URL

// Generic API request function
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API request failed:', error);
    return { 
      success: false, 
      error: error.message,
      data: null 
    };
  }
}

// Modbus Device API
export const modbusAPI = {
  // Get all devices
  getDevices: () => apiRequest('/modbus/devices/'),
  
  // Get single device
  getDevice: (id) => apiRequest(`/modbus/devices/${id}/`),
  
  // Create new device
  createDevice: (deviceData) => apiRequest('/modbus/devices/', {
    method: 'POST',
    body: deviceData,
  }),
  
  // Update device
  updateDevice: (id, deviceData) => apiRequest(`/modbus/devices/${id}/`, {
    method: 'PUT',
    body: deviceData,
  }),
  
  // Delete device
  deleteDevice: (id) => apiRequest(`/modbus/devices/${id}/`, {
    method: 'DELETE',
  }),
  
  // Apply configuration to BeagleBone
  applyConfiguration: (id) => apiRequest(`/modbus/devices/${id}/apply_configuration/`, {
    method: 'POST',
  }),
  
  // Get configuration logs
  getConfigLogs: (deviceId) => apiRequest(`/modbus/devices/${deviceId}/config_logs/`),
};

// Configuration Logs API
export const configLogsAPI = {
  getLogs: () => apiRequest('/modbus/config-logs/'),
  getLog: (id) => apiRequest(`/modbus/config-logs/${id}/`),
};

// Health check API
export const healthAPI = {
  checkBackend: () => apiRequest('/health/'),
  checkInfluxDB: () => apiRequest('/health/influxdb/'),
  checkModbus: () => apiRequest('/health/modbus/'),
};

export default apiRequest;
