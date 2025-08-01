import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  updateElevator: (id, data) => apiClient.patch(`/elevators/${id}`, data),
  getElevators: () => apiClient.get('/elevators'),
  createElevator: (data) => apiClient.post('/elevators', data),
  updateMaintenanceLog: (id, data) => apiClient.patch(`/maintenance/${id}`, data),
  createRequest: (data) => apiClient.post('/requests', data),
  getMaintenanceLogs: () => apiClient.get('/maintenance'),
  createMaintenanceLog: (data) => apiClient.post('/maintenance', data),
};