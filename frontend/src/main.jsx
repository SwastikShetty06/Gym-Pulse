import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'
import { registerSW } from 'virtual:pwa-register'
import axios from 'axios'
import ErrorBoundary from './components/ErrorBoundary'

registerSW({ immediate: true })

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://gym-pulse-backend.vercel.app' : 'http://localhost:5001');
axios.defaults.baseURL = API_URL;

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>,
)
