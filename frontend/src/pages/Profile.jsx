import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { User, Mail, Award, Settings, Shield, Zap, Target, LogOut } from 'lucide-react'

const Profile = () => {
    const { user, token, logout } = useAuthStore()
    const [prs, setPrs] = useState([])
    const [lib, setLib] = useState([])
    const [loading, setLoading] = useState(true)
    const [newPr, setNewPr] = useState({ exercise: '', weight: '', reps: '' })

    useEffect(() => {
        const fetchPrs = async () => {
            try {
                const config = { headers: { 'x-auth-token': token } }
                const [prRes, libRes] = await Promise.all([
                    axios.get('/api/prs', config),
                    axios.get('/api/exercises', config)
                ])
                setPrs(prRes.data)
                setLib(libRes.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchPrs()
    }, [token])

    const handleAddPr = async (e) => {
        e.preventDefault()
        try {
            const config = { headers: { 'x-auth-token': token } }
            await axios.post('/api/prs', newPr, config)
            const updated = await axios.get('/api/prs', config)
            setPrs(updated.data)
            setNewPr({ exercise: '', weight: '', reps: '' })
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="profile-container" style={styles.container}>
            <header style={styles.header}>
                <h1 style={{ fontSize: '3rem' }}>Your <span className="gradient-text">Profile</span></h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Manage your account and track your peak performance</p>
            </header>

            <div className="bento-grid" style={styles.grid}>
                {/* Profile Identity Card - Span 4 */}
                <div className="glass hover-lift radial-glow" style={{ ...styles.card, gridColumn: 'span 4', alignItems: 'center', textAlign: 'center' }}>
                    <div style={styles.avatar}>
                        <User size={48} color="white" />
                        <div style={styles.badge}><Zap size={14} fill="white" /></div>
                    </div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>{user?.name}</h2>

                    <div style={styles.infoStack}>
                        <div style={styles.miniInfo}>
                            <Mail size={16} color="var(--text-secondary)" />
                            <span>{user?.email}</span>
                        </div>
                        <div style={styles.miniInfo}>
                            <Shield size={16} color="var(--text-secondary)" />
                            <span>Member since Jan 2026</span>
                        </div>
                    </div>

                    <button className="glass" style={styles.actionBtn}>
                        <Settings size={18} />
                        <span>Edit Account</span>
                    </button>
                </div>

                {/* Achievement Summary - Span 8 */}
                <div className="glass hover-lift" style={{ ...styles.card, gridColumn: 'span 8' }}>
                    <div style={styles.cardHeader}>
                        <div style={styles.iconBox}>
                            <Target size={20} color="var(--accent-secondary)" />
                        </div>
                        <h3 style={{ marginLeft: '1rem' }}>Gains Overview</h3>
                    </div>
                    <div className="stats-overview" style={styles.statsOverview}>
                        <div style={styles.simpleStat}>
                            <p style={styles.statLabel}>Total PRs</p>
                            <p style={styles.statValue}>{prs.length}</p>
                        </div>
                        <div style={styles.simpleStat}>
                            <p style={styles.statLabel}>Muscle Groups</p>
                            <p style={styles.statValue}>8</p>
                        </div>
                    </div>
                </div>

                {/* PR Logger Window - Span 12 */}
                <div className="glass hover-lift" style={{ ...styles.card, gridColumn: 'span 12' }}>
                    <div style={styles.cardHeader}>
                        <div style={styles.iconBox}>
                            <Award size={20} color="var(--accent-primary)" />
                        </div>
                        <h3 style={{ marginLeft: '1rem' }}>Strength Vault</h3>
                    </div>

                    <form onSubmit={handleAddPr} className="pr-form" style={styles.prForm}>
                        <div style={{ flex: 2 }}>
                            <label style={styles.label}>Exercise</label>
                            <input
                                list="pr-exercises"
                                value={newPr.exercise}
                                onChange={(e) => setNewPr({ ...newPr, exercise: e.target.value })}
                                style={styles.input}
                                placeholder="Select exercise..."
                                required
                            />
                            <datalist id="pr-exercises">
                                {(lib || []).map(ex => <option key={ex._id} value={ex.name} />)}
                            </datalist>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={styles.label}>Weight (kg)</label>
                            <input
                                type="number"
                                value={newPr.weight}
                                onChange={(e) => setNewPr({ ...newPr, weight: e.target.value })}
                                style={styles.input}
                                required
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={styles.label}>Reps</label>
                            <input
                                type="number"
                                value={newPr.reps}
                                onChange={(e) => setNewPr({ ...newPr, reps: e.target.value })}
                                style={styles.input}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-primary" style={{ height: '45px', marginTop: '1.4rem' }}>
                            Log
                        </button>
                    </form>

                    <div style={styles.scrollList}>
                        {(!prs || prs.length === 0) ? (
                            <div style={styles.emptyState}>
                                <p>No PRs recorded yet. Time to test your limits!</p>
                            </div>
                        ) : (
                            prs.map(pr => (
                                <div key={pr._id} style={styles.prRow}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={styles.dot} />
                                        <p style={{ fontWeight: 600 }}>{pr.exercise}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{pr.weight} kg</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{pr.reps} reps</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <button onClick={logout} className="hover-lift" style={styles.logoutBtnMobile}>
                <LogOut size={20} />
                Sign Out
            </button>
        </div >
    )
}

const styles = {
    container: {
        padding: '3rem 2rem',
        minHeight: '100vh',
        maxWidth: '1300px',
        margin: '0 auto'
    },
    header: {
        marginBottom: '3rem'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gridAutoRows: 'minmax(140px, auto)',
        gap: '1.5rem'
    },
    card: {
        padding: '2.5rem 2rem',
        display: 'flex',
        flexDirection: 'column',
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '2rem'
    },
    iconBox: {
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--glass-border)'
    },
    avatar: {
        width: '110px',
        height: '110px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem',
        position: 'relative',
        boxShadow: '0 0 40px rgba(99, 102, 241, 0.3)'
    },
    badge: {
        position: 'absolute',
        bottom: '0',
        right: '0',
        width: '32px',
        height: '32px',
        background: 'var(--bg-primary)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid var(--accent-primary)'
    },
    infoStack: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.875rem',
        marginBottom: '2rem'
    },
    miniInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.9rem',
        color: 'var(--text-secondary)'
    },
    actionBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.875rem 1.25rem',
        borderRadius: '14px',
        color: 'white',
        fontWeight: 600,
        fontSize: '0.9rem'
    },
    statsOverview: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1.5rem'
    },
    simpleStat: {
        padding: '1.5rem',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '16px',
        border: '1px solid var(--glass-border)',
        textAlign: 'center'
    },
    statLabel: {
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        marginBottom: '0.5rem'
    },
    statValue: {
        fontSize: '1.75rem',
        fontWeight: 800
    },
    prForm: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '2.5rem',
        alignItems: 'center',
        padding: '1.5rem',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '20px',
        border: '1px solid var(--glass-border)'
    },
    label: {
        fontSize: '0.75rem',
        color: 'var(--text-secondary)',
        marginBottom: '0.5rem',
        display: 'block',
        fontWeight: 600
    },
    input: {
        width: '100%',
        background: 'var(--bg-primary)',
        border: '1px solid var(--glass-border)',
        borderRadius: '10px',
        color: 'white',
        padding: '0.75rem',
        fontSize: '0.95rem',
        outline: 'none'
    },
    scrollList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        maxHeight: '400px',
        overflowY: 'auto',
        paddingRight: '0.5rem'
    },
    prRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.25rem',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '16px',
        border: '1px solid var(--glass-border)',
        transition: 'all 0.2s ease'
    },
    dot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: 'var(--accent-primary)',
        boxShadow: '0 0 10px var(--accent-primary)'
    },
    emptyState: {
        textAlign: 'center',
        padding: '3rem',
        color: 'var(--text-secondary)',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '16px',
        border: '1px dashed var(--glass-border)'
    },
    logoutBtnMobile: {
        marginTop: '2rem',
        width: '100%',
        padding: '1rem',
        borderRadius: '16px',
        background: 'rgba(239, 68, 68, 0.1)',
        color: 'var(--danger)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        fontSize: '1rem',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem'
    }
}

export default Profile
