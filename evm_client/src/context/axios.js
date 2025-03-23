import axios from 'axios';
import { evmKey } from '../pages/EvmRegister'; 

const axiosInstance = axios.create({
  baseURL: 'baseurl', // Replace with actual base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (evmKey) {
      config.headers['x-evm-id'] = evmKey;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
