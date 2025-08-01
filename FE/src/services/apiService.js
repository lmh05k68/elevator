import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000', // URL backend của bạn
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  getElevators: () => apiClient.get('/elevators'),
  createElevator: (data) => apiClient.post('/elevators', data),
  updateMaintenanceLog: (id, data) => apiClient.patch(`/maintenance/${id}`, data),
  createRequest: (data) => apiClient.post('/requests', data),
  getMaintenanceLogs: () => apiClient.get('/maintenance'),
  createMaintenanceLog: (data) => apiClient.post('/maintenance', data),
};