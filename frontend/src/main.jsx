import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import axios from 'axios'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    },
  },
})

// Configure axios defaults - use proxy in dev if VITE_API_URL is not set
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';
axios.defaults.headers.post['Content-Type'] = 'application/json';

// Configure default timeout
axios.defaults.timeout = 90000; // 90 seconds (AI analysis can be slow)

// Add request interceptor for development debugging
if (import.meta.env.MODE === 'development') {
  axios.interceptors.request.use(request => {
    console.log('API Request:', request.method?.toUpperCase(), request.url);
    return request;
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
