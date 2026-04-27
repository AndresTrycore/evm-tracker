import axios, { AxiosError } from 'axios';
import { ApiError } from '../types';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejo de errores global (FastAPI logic)
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    // Transformar el error del backend (detail) a un formato estándar de la app
    const message = error.response?.data?.detail || 'Error inesperado del servidor';
    
    const apiError: ApiError = {
      message: typeof message === 'string' ? message : JSON.stringify(message),
      status: error.response?.status,
      originalError: error,
    };

    return Promise.reject(apiError);
  }
);
