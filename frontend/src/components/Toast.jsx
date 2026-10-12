import React from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { useToastStore } from '../store/toastStore'

export const ToastContainer = () => {
    const { toasts, removeToast } = useToastStore()

    if (!toasts.length) return null

    return (
        <div
            aria-live="polite"
            className="toast-container"
            style={{
                position: 'fixed',
                zIndex: 99999,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                pointerEvents: 'none'
            }}
        >
            {toasts.map((toast) => {
                const isError = toast.type === 'error'
                const isSuccess = toast.type === 'success'

                return (
                    <div
                        key={toast.id}
                        role="alert"
                        style={{
                            pointerEvents: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            backgroundColor: '#18181b',
                            border: `1px solid ${isError ? '#7f1d1d' : isSuccess ? '#14532d' : '#27272a'}`,
                            borderRadius: '8px',
                            padding: '10px 14px',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                            transition: 'all 120ms ease-out'
                        }}
                    >
                        <div style={{ flexShrink: 0 }}>
                            {isError ? (
                                <AlertCircle size={16} color="#ef4444" />
                            ) : isSuccess ? (
                                <CheckCircle2 size={16} color="#10b981" />
                            ) : (
                                <Info size={16} color="#3b82f6" />
                            )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                                style={{
                                    fontSize: '0.8125rem',
                                    color: '#f4f4f5',
                                    margin: 0,
                                    lineHeight: 1.3,
                                    wordBreak: 'break-word'
                                }}
                            >
                                {toast.message}
                            </p>
                        </div>

                        {toast.action && (
                            <button
                                onClick={() => {
                                    toast.action.onClick?.()
                                    removeToast(toast.id)
                                }}
                                style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    color: '#3b82f6',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                {toast.action.label}
                            </button>
                        )}

                        <button
                            onClick={() => removeToast(toast.id)}
                            aria-label="Dismiss toast"
                            style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: '#71717a',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <X size={14} />
                        </button>
                    </div>
                )
            })}

            <style>{`
                @media (min-width: 769px) {
                    .toast-container {
                        bottom: 24px;
                        right: 24px;
                        min-width: 300px;
                        max-width: 420px;
                    }
                }
                @media (max-width: 768px) {
                    .toast-container {
                        bottom: calc(var(--mobile-nav-height, 60px) + env(safe-area-inset-bottom, 16px) + 8px);
                        left: 12px;
                        right: 12px;
                        width: auto;
                    }
                }
            `}</style>
        </div>
    )
}

export default ToastContainer
