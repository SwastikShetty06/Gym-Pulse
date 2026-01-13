import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Dumbbell, Mail, Lock, Loader2 } from 'lucide-react'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { login, loading, error } = useAuthStore()

    const handleSubmit = async (e) => {
        e.preventDefault()
        await login(email, password)
    }

    return (
        <div style={styles.container}>
            <div className="glass" style={styles.card}>
                <div style={styles.header}>
                    <Dumbbell size={48} color="var(--accent-primary)" />
                    <h1 style={{ marginTop: '1rem', fontSize: '2rem' }}>Welcome Back</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Log in to your gym hub</p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <Mail size={18} style={styles.icon} />
                        <input
                            type="email"
                            placeholder="Email "
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <Lock size={18} style={styles.icon} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>

                    {error && <p style={styles.error}>{error}</p>}

                    <button type="submit" className="btn-primary" style={styles.button} disabled={loading}>
                        {loading ? <Loader2 className="spinning" size={20} /> : 'Sign In'}
                    </button>

                    <button
                        type="button"
                        className="btn-primary" style={styles.button} disabled={loading}
                        onClick={() => login('pro1768207294996@gym.com', 'password123')}
                    >
                        Try Demo Account
                    </button>
                </form>

                <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Sign Up</Link>
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
        background: '#09090b',
        backgroundImage: `
            radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(168, 85, 247, 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(59, 130, 246, 0.15) 0px, transparent 50%),
            radial-gradient(at 0% 100%, rgba(236, 72, 153, 0.15) 0px, transparent 50%)
        `,
        backgroundSize: '100% 100%',
    },
    card: {
        width: '100%',
        maxWidth: '420px',
        padding: '3rem',
        borderRadius: '24px',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    },
    header: {
        textAlign: 'center',
        marginBottom: '2.5rem'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
    },
    inputGroup: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        transition: 'transform 0.2s'
    },
    icon: {
        position: 'absolute',
        left: '1.25rem',
        color: 'var(--text-secondary)',
        zIndex: 10
    },
    input: {
        width: '100%',
        padding: '1rem 1rem 1rem 3.5rem',
        background: 'rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        color: 'white',
        fontSize: '1rem',
        transition: 'all 0.3s ease',
        outline: 'none'
    },
    button: {
        width: '100%',
        marginTop: '0.5rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1rem',
        borderRadius: '16px',
        fontWeight: 600,
        fontSize: '1rem',
        letterSpacing: '0.5px'
    },
    error: {
        color: '#ef4444',
        fontSize: '0.875rem',
        textAlign: 'center',
        background: 'rgba(239, 68, 68, 0.1)',
        padding: '0.75rem',
        borderRadius: '12px'
    }
}

export default Login
