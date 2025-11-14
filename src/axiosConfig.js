import axios from 'axios';
import auth from './env';

const getHost = () => (auth.DEV ? auth.DEV_URL : auth.PROD_URL);

// Create axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: getHost(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add basic auth to requests if needed
axiosInstance.interceptors.request.use(
  (config) => {
    // Add basic auth for all requests
    const Busername = auth.BASIC_AUTH_USERNAME;
    const Bpassword = auth.BASIC_AUTH_PASSWORD;
    const token = btoa(`${Busername}:${Bpassword}`);
    
    config.headers.Authorization = `Basic ${token}`;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
