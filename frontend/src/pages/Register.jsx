import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Activity, Mail, Lock, User, Loader2 } from 'lucide-react'

export const Register = () => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { register, loading, error } = useAuthStore()

    const handleSubmit = async (e) => {
        e.preventDefault()
        await register(name, email, password)
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <div style={styles.logoBadge}>
                        <Activity size={20} color="#ffffff" />
                    </div>
                    <h1 style={{ marginTop: '12px', marginBottom: '4px' }}>Create Athlete Account</h1>
                    <p style={{ color: '#71717a', fontSize: '0.8125rem' }}>
                        Register to initialize your personalized volume tracking split
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Full Name</label>
                        <div style={styles.inputWrapper}>
                            <User size={15} color="#71717a" style={styles.icon} />
                            <input
                                type="text"
                                placeholder="Alex Mercer"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                style={styles.input}
                                required
                            />
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email Address</label>
                        <div style={styles.inputWrapper}>
                            <Mail size={15} color="#71717a" style={styles.icon} />
                            <input
                                type="email"
                                placeholder="athlete@domain.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={styles.input}
                                required
                            />
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Master Password</label>
                        <div style={styles.inputWrapper}>
                            <Lock size={15} color="#71717a" style={styles.icon} />
                            <input
                                type="password"
                                placeholder="••••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={styles.input}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={styles.errorBox}>
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn-primary"
                        style={styles.submitBtn}
                        disabled={loading}
                    >
                        {loading ? <Loader2 size={16} className="spinning" /> : 'Register Account'}
                    </button>
                </form>

                <p style={styles.footerText}>
                    Already registered?{' '}
                    <Link to="/login" style={styles.link}>
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    )
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#09090b',
        padding: '16px'
    },
    card: {
        width: '100%',
        maxWidth: '380px',
        padding: '32px 24px',
        borderRadius: '8px',
        backgroundColor: '#121215',
        border: '1px solid #27272a'
    },
    header: {
        textAlign: 'center',
        marginBottom: '24px'
    },
    logoBadge: {
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        backgroundColor: '#18181b',
        border: '1px solid #27272a',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    label: {
        fontSize: '0.75rem',
        color: '#a1a1aa',
        fontWeight: 500
    },
    inputWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
    },
    icon: {
        position: 'absolute',
        left: '10px',
        pointerEvents: 'none'
    },
    input: {
        width: '100%',
        backgroundColor: '#18181b',
        border: '1px solid #27272a',
        color: '#f4f4f5',
        borderRadius: '6px',
        padding: '8px 12px 8px 34px',
        fontSize: '0.8125rem'
    },
    errorBox: {
        padding: '8px 12px',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '6px',
        color: '#ef4444',
        fontSize: '0.75rem'
    },
    submitBtn: {
        width: '100%',
        padding: '9px 16px',
        marginTop: '6px'
    },
    footerText: {
        marginTop: '20px',
        textAlign: 'center',
        fontSize: '0.8125rem',
        color: '#71717a'
    },
    link: {
        color: '#3b82f6',
        textDecoration: 'none',
        fontWeight: 500
    }
}

export default Register
