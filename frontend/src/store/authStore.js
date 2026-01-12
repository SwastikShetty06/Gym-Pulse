import { create } from 'zustand'
import axios from 'axios'

export const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
    error: null,

    login: async (email, password) => {
        set({ loading: true, error: null })
        try {
            const res = await axios.post('/api/auth/login', { email, password })
            localStorage.setItem('token', res.data.token)
            set({ user: res.data.user, token: res.data.token, loading: false })
            return true
        } catch (err) {
            set({ error: err.response?.data?.message || 'Login failed', loading: false })
            return false
        }
    },

    register: async (name, email, password) => {
        set({ loading: true, error: null })
        try {
            const res = await axios.post('/api/auth/register', { name, email, password })
            localStorage.setItem('token', res.data.token)
            set({ user: res.data.user, token: res.data.token, loading: false })
            return true
        } catch (err) {
            set({ error: err.response?.data?.message || 'Registration failed', loading: false })
            return false
        }
    },

    logout: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null })
    }
}))
