import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'
import { User, Mail, Award, Shield, Target, LogOut, Lock, Unlock, Plus } from 'lucide-react'

export const Profile = () => {
    const { user, token, logout } = useAuthStore()
    const { addToast } = useToastStore()
    const [prs, setPrs] = useState([])
    const [lib, setLib] = useState([])
    const [loading, setLoading] = useState(true)
    const [isPrivate, setIsPrivate] = useState(false)
    const [newPr, setNewPr] = useState({ exercise: '', weight: '', reps: '' })
    const [submittingPr, setSubmittingPr] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { 'x-auth-token': token } }
                const [prRes, libRes, userRes] = await Promise.all([
                    axios.get('/api/prs', config),
                    axios.get('/api/exercises', config),
                    axios.get('/api/auth/user', config)
                ])
                setPrs(prRes.data || [])
                setLib(libRes.data || [])
                setIsPrivate(Boolean(userRes.data?.isPrivate))
            } catch (err) {
                console.error(err)
                addToast({ message: `Profile sync failed: ${err.message}`, type: 'error' })
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [token])

    const togglePrivacy = async () => {
        const nextState = !isPrivate
        setIsPrivate(nextState)
        addToast({
            message: nextState ? 'Account set to Private' : 'Account set to Public',
            type: 'info'
        })

        try {
            const config = { headers: { 'x-auth-token': token } }
            const res = await axios.put('/api/auth/privacy', {}, config)
            setIsPrivate(Boolean(res.data?.isPrivate))
        } catch (err) {
            console.error('Error toggling privacy:', err)
            setIsPrivate(!nextState)
            addToast({ message: 'Privacy toggle failed to persist', type: 'error' })
        }
    }

    const handleAddPr = async (e) => {
        e.preventDefault()
        if (submittingPr) return
        setSubmittingPr(true)

        const optimisticPr = {
            _id: `temp-${Date.now()}`,
            exercise: newPr.exercise,
            weight: Number(newPr.weight),
            reps: Number(newPr.reps),
            date: new Date().toISOString()
        }

        const prevPrs = [...prs]
        setPrs([optimisticPr, ...prs])
        addToast({
            message: `Recorded PR: ${newPr.exercise} (${newPr.weight}kg × ${newPr.reps})`,
            type: 'success'
        })
        const toSave = { ...newPr }
        setNewPr({ exercise: '', weight: '', reps: '' })

        try {
            const config = { headers: { 'x-auth-token': token } }
            await axios.post('/api/prs', toSave, config)
            const updated = await axios.get('/api/prs', config)
            setPrs(updated.data || [])
        } catch (err) {
            console.error(err)
            setPrs(prevPrs)
            addToast({
                message: `Failed to record PR: ${err.message}`,
                type: 'error'
            })
        } finally {
            setSubmittingPr(false)
        }
    }

    return (
        <div style={styles.container} className="profile-container">
            {/* Header */}
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <h1>Account & Personal Records</h1>
                    <p style={styles.headerSub}>
                        Manage privacy settings, identity credentials, and personal record registry.
                    </p>
                </div>
            </header>

            <div style={styles.grid} className="bento-grid">
                {/* Identity Card */}
                <div style={{ ...styles.card, gridColumn: 'span 4', textAlign: 'center', alignItems: 'center' }}>
                    <div style={styles.avatar}>
                        {(user?.name?.[0] || 'A').toUpperCase()}
                    </div>
                    <h2 style={{ fontSize: '1.125rem', marginTop: '12px', marginBottom: '2px' }}>
                        {user?.name || 'Athlete'}
                    </h2>
                    <span style={{ fontSize: '0.75rem', color: '#71717a' }}>{user?.email}</span>

                    <div style={styles.identityMeta}>
                        <div style={styles.metaRow}>
                            <Mail size={14} color="#71717a" />
                            <span>{user?.email}</span>
                        </div>
                        <div style={styles.metaRow}>
                            <Shield size={14} color="#71717a" />
                            <span>Tier-1 Athlete</span>
                        </div>
                    </div>

                    <div style={{ width: '100%', marginTop: '16px' }}>
                        <button
                            onClick={togglePrivacy}
                            className="btn-secondary"
                            style={{ width: '100%', fontSize: '0.8125rem' }}
                        >
                            {isPrivate ? <Lock size={14} color="#3b82f6" /> : <Unlock size={14} />}
                            <span>{isPrivate ? 'Profile: Private' : 'Profile: Public'}</span>
                        </button>
                    </div>
                </div>

                {/* Gains Overview Card */}
                <div style={{ ...styles.card, gridColumn: 'span 8' }}>
                    <div style={styles.cardHeader}>
                        <div style={styles.iconBox}>
                            <Target size={16} color="#3b82f6" />
                        </div>
                        <div>
                            <h2>Performance Metric Summary</h2>
                            <p style={styles.cardSub}>Verified benchmarks</p>
                        </div>
                    </div>

                    <div style={styles.statsOverview} className="stats-overview">
                        <div style={styles.statBox}>
                            <span style={styles.statLabel}>Recorded PRs</span>
                            <span style={styles.statVal} className="tabular-nums">
                                {prs.length}
                            </span>
                        </div>
                        <div style={styles.statBox}>
                            <span style={styles.statLabel}>Active Network</span>
                            <span style={styles.statVal} className="tabular-nums">
                                {user?.friends?.length || 0}
                            </span>
                        </div>
                    </div>
                </div>

                {/* PR Logger Window */}
                <div style={{ ...styles.card, gridColumn: 'span 12' }}>
                    <div style={styles.cardHeader}>
                        <div style={styles.iconBox}>
                            <Award size={16} color="#3b82f6" />
                        </div>
                        <div>
                            <h2>Personal Record Vault</h2>
                            <p style={styles.cardSub}>Log new maximum weight achievements</p>
                        </div>
                    </div>

                    <form onSubmit={handleAddPr} style={styles.prForm} className="pr-form">
                        <div style={{ flex: 2, minWidth: '180px' }}>
                            <label style={styles.label}>Movement</label>
                            <input
                                list="pr-exercises"
                                value={newPr.exercise}
                                onChange={(e) => setNewPr({ ...newPr, exercise: e.target.value })}
                                style={styles.input}
                                placeholder="Select or type exercise..."
                                required
                            />
                            <datalist id="pr-exercises">
                                {(lib || []).map((ex) => (
                                    <option key={ex._id || ex.name} value={ex.name} />
                                ))}
                            </datalist>
                        </div>

                        <div style={{ flex: 1, minWidth: '100px' }}>
                            <label style={styles.label}>Weight (kg)</label>
                            <input
                                type="number"
                                min="1"
                                max="600"
                                value={newPr.weight}
                                onChange={(e) => setNewPr({ ...newPr, weight: e.target.value })}
                                style={styles.input}
                                className="tabular-nums"
                                placeholder="100"
                                required
                            />
                        </div>

                        <div style={{ flex: 1, minWidth: '100px' }}>
                            <label style={styles.label}>Reps</label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={newPr.reps}
                                onChange={(e) => setNewPr({ ...newPr, reps: e.target.value })}
                                style={styles.input}
                                className="tabular-nums"
                                placeholder="5"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submittingPr}
                            className="btn-primary"
                            style={{ alignSelf: 'flex-end', padding: '8px 16px', fontSize: '0.8125rem' }}
                        >
                            <Plus size={14} />
                            <span>{submittingPr ? 'Logging...' : 'Log PR'}</span>
                        </button>
                    </form>

                    <div style={styles.scrollList}>
                        {!prs || prs.length === 0 ? (
                            <div style={styles.emptyState}>
                                <p style={{ fontSize: '0.8125rem', color: '#71717a', margin: 0 }}>
                                    No personal records registered. Log a lift above to initialize your vault.
                                </p>
                            </div>
                        ) : (
                            prs.map((pr) => (
                                <div key={pr._id} style={styles.prRow}>
                                    <div>
                                        <p style={styles.prTitle}>{pr.exercise}</p>
                                        <p style={styles.prDate}>
                                            {pr.date ? new Date(pr.date).toLocaleDateString() : 'Recorded'}
                                        </p>
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <span style={styles.prWeight} className="tabular-nums">
                                            {pr.weight} <span style={{ fontSize: '0.75rem', color: '#71717a' }}>kg</span>
                                        </span>
                                        <p style={styles.prReps} className="tabular-nums">
                                            {pr.reps} {pr.reps === 1 ? 'rep' : 'reps'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    onClick={logout}
                    className="btn-secondary"
                    style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    )
}

const styles = {
    container: {
        padding: '24px 32px',
        maxWidth: '1200px',
        margin: '0 auto',
        minHeight: '100vh',
        boxSizing: 'border-box'
    },
    header: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '20px',
        borderBottom: '1px solid #27272a',
        paddingBottom: '16px'
    },
    headerLeft: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    headerSub: {
        fontSize: '0.8125rem',
        color: '#a1a1aa'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: '16px'
    },
    card: {
        backgroundColor: '#121215',
        border: '1px solid #27272a',
        borderRadius: '8px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px'
    },
    iconBox: {
        width: '32px',
        height: '32px',
        borderRadius: '6px',
        backgroundColor: '#18181b',
        border: '1px solid #27272a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    },
    cardSub: {
        fontSize: '0.75rem',
        color: '#71717a'
    },
    avatar: {
        width: '56px',
        height: '56px',
        borderRadius: '8px',
        backgroundColor: '#18181b',
        border: '1px solid #27272a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.25rem',
        fontWeight: 600,
        color: '#f4f4f5'
    },
    identityMeta: {
        width: '100%',
        marginTop: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        textAlign: 'left'
    },
    metaRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.75rem',
        color: '#71717a'
    },
    statsOverview: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginTop: '8px'
    },
    statBox: {
        backgroundColor: '#18181b',
        border: '1px solid #27272a',
        borderRadius: '6px',
        padding: '16px'
    },
    statLabel: {
        display: 'block',
        fontSize: '0.75rem',
        color: '#71717a',
        marginBottom: '4px'
    },
    statVal: {
        fontSize: '1.75rem',
        fontWeight: 600,
        color: '#f4f4f5'
    },
    prForm: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        marginBottom: '16px',
        backgroundColor: '#18181b',
        border: '1px solid #27272a',
        borderRadius: '6px',
        padding: '12px'
    },
    label: {
        display: 'block',
        fontSize: '0.6875rem',
        color: '#71717a',
        marginBottom: '4px'
    },
    input: {
        width: '100%',
        backgroundColor: '#121215',
        border: '1px solid #27272a',
        color: '#f4f4f5',
        borderRadius: '4px',
        padding: '6px 10px',
        fontSize: '0.8125rem'
    },
    scrollList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        maxHeight: '300px',
        overflowY: 'auto'
    },
    emptyState: {
        padding: '24px',
        textAlign: 'center',
        border: '1px dashed #27272a',
        borderRadius: '6px'
    },
    prRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 14px',
        backgroundColor: '#18181b',
        border: '1px solid #27272a',
        borderRadius: '6px'
    },
    prTitle: {
        fontSize: '0.8125rem',
        fontWeight: 500,
        color: '#f4f4f5',
        margin: 0
    },
    prDate: {
        fontSize: '0.6875rem',
        color: '#71717a',
        margin: 0
    },
    prWeight: {
        fontSize: '1rem',
        fontWeight: 600,
        color: '#3b82f6'
    },
    prReps: {
        fontSize: '0.6875rem',
        color: '#71717a',
        margin: 0
    }
}

export default Profile
