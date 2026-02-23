import axios from 'axios';


const isDevelopment = import.meta.env.MODE === 'development'
const baseURL = isDevelopment ? import.meta.env.VITE_API_BASE_URL_LOCAL : import.meta.env.VITE_API_BASE_URL_DEPLOY

const api = axios.create({
    baseURL: baseURL,
});


let activeRequests = 0;
let wakeUpTimeout = null;

const startRequestTracking = () => {
    activeRequests++;
    if (activeRequests === 1 && !isDevelopment) {
        wakeUpTimeout = setTimeout(() => {
            window.dispatchEvent(new CustomEvent('server-waking-up'));
        }, 4000); // Trigger message if request takes > 4s
    }
};

const endRequestTracking = () => {
    activeRequests = Math.max(0, activeRequests - 1);
    if (activeRequests === 0) {
        clearTimeout(wakeUpTimeout);
        window.dispatchEvent(new CustomEvent('server-awake'));
    }
};

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        startRequestTracking();
        return config;
    },
    (error) => {
        endRequestTracking();
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        endRequestTracking();
        return response;
    },
    async (error) => {
        endRequestTracking();
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    const response = await axios.post(`${baseURL}token/refresh/`, {
                        refresh: refreshToken,
                    });
                    localStorage.setItem('access_token', response.data.access);
                    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
                    originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
