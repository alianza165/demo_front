// utils/helpers.js
export const formatModbusAddress = (address) => {
  return `0x${address.toString(16).toUpperCase()}`;
};

export const validateModbusConfig = (config) => {
  const errors = {};
  
  if (!config.name?.trim()) {
    errors.name = 'Device name is required';
  }
  
  if (config.address < 1 || config.address > 247) {
    errors.address = 'Modbus address must be between 1 and 247';
  }
  
  if (!config.port?.trim()) {
    errors.port = 'Serial port is required';
  }
  
  return errors;
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
