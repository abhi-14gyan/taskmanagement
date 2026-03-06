import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1',
    withCredentials: true, // Always send HttpOnly cookies cross-origin
    headers: {
        'Content-Type': 'application/json',
    },
});

// ── Request Interceptor ────────────────────────────────────────────────────────
// Useful hook for attaching tokens or tracing headers in the future
api.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
);

// ── Response Interceptor ───────────────────────────────────────────────────────
// Handles 401 globally — redirects to login if session has expired
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (
            typeof window !== 'undefined' &&
            error.response?.status === 401 &&
            !window.location.pathname.includes('/login')
        ) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
