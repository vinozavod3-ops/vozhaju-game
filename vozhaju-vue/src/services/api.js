import axios from 'axios';
import { toast } from 'vue3-toastify';
import { useGameStore } from '../stores/gameStore';

const api = axios.create({
  baseURL: 'https://vozhaju-game.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vozhajuToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle global errors (like 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.warn('Network error (Offline mode active)');
    } else if (error.response.status === 401) {
      const store = useGameStore();
      store.logout();
      window.location.href = '/';
      toast.error('Вақти сессия ба охир расид. Лутфан дубора ворид шавед.');
    } else if (error.response.status >= 500) {
      toast.error('Хатогӣ дар сервер. Лутфан каме пас кӯшиш кунед.');
    }
    return Promise.reject(error);
  }
);

export default api;
