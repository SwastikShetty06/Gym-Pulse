import { create } from 'zustand'

export const useToastStore = create((set) => ({
    toasts: [],
    
    // Add a toast notification
    // type: 'success' | 'error' | 'info'
    addToast: ({ message, type = 'info', action = null, duration = 3200 }) => {
        const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
        set((state) => ({
            toasts: [...state.toasts.slice(-3), { id, message, type, action }] // keep max 4 toasts
        }))

        if (duration > 0) {
            setTimeout(() => {
                set((state) => ({
                    toasts: state.toasts.filter((t) => t.id !== id)
                }))
            }, duration)
        }
        return id
    },

    removeToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id)
        }))
    }
}))
