import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Dumbbell, Mail, Lock, User, Loader2 } from 'lucide-react'

const Register = () => {
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
            <div className="glass" style={styles.card}>
                <div style={styles.header}>
                    <Dumbbell size={48} color="var(--accent-primary)" />
                    <h1 style={{ marginTop: '1rem', fontSize: '2rem' }}>Get Started</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Join the elite gym squad</p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <User size={18} style={styles.icon} />
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>
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
                        {loading ? <Loader2 className="spinning" size={20} /> : 'Create Account'}
                    </button>
                </form>

                <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Log In</Link>
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
        background: 'radial-gradient(circle at top left, #1a1a2e, #0a0a0c)'
    },
    card: {
        width: '100%',
        maxWidth: '400px',
        padding: '2.5rem',
    },
    header: {
        textAlign: 'center',
        marginBottom: '2rem'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    },
    inputGroup: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
    },
    icon: {
        position: 'absolute',
        left: '1rem',
        color: 'var(--text-secondary)'
    },
    input: {
        width: '100%',
        padding: '0.875rem 1rem 0.875rem 3rem',
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--glass-border)',
        borderRadius: '12px',
        color: 'white',
        fontSize: '1rem'
    },
    button: {
        width: '100%',
        marginTop: '1rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    error: {
        color: 'var(--danger)',
        fontSize: '0.875rem',
        textAlign: 'center'
    }
}

export default Register
