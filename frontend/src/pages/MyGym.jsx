import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
    MapPin,
    Users,
    Activity,
    LogIn,
    LogOut,
    Search,
    PlusCircle,
    Lock
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'
import FriendProfileModal from '../components/FriendProfileModal'

export const MyGym = () => {
    const { token, user, checkAuth } = useAuthStore()
    const { addToast } = useToastStore()

    const [gym, setGym] = useState(null)
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [isCreating, setIsCreating] = useState(false)
    const [newGymData, setNewGymData] = useState({ name: '', location: '', description: '' })
    const [checkedIn, setCheckedIn] = useState(false)
    const [occupancy, setOccupancy] = useState(0)
    const [selectedMember, setSelectedMember] = useState(null)
    const [confirmingLeave, setConfirmingLeave] = useState(false)

    const handleViewProfile = async (memberId) => {
        try {
            const res = await axios.get(`/api/social/profile/${memberId}`, {
                headers: { 'x-auth-token': token }
            })
            setSelectedMember(res.data)
        } catch (err) {
            console.error(err)
            addToast({ message: `Failed to load profile: ${err.message}`, type: 'error' })
        }
    }

    const handleLeave = async () => {
        try {
            await axios.post('/api/gyms/leave', {}, { headers: { 'x-auth-token': token } })
            await checkAuth()
            setConfirmingLeave(false)
            addToast({ message: 'Left gym clan', type: 'info' })
        } catch (err) {
            console.error(err)
            addToast({ message: `Failed to leave gym: ${err.message}`, type: 'error' })
        }
    }

    useEffect(() => {
        if (user && user.gym) {
            fetchGymDetails()
        } else {
            fetchDefaultGyms()
            setLoading(false)
        }
    }, [user])

    const fetchDefaultGyms = async () => {
        try {
            const res = await axios.get('/api/gyms')
            setSearchResults(res.data || [])
        } catch (err) {
            console.error('Failed to fetch default gyms', err)
        }
    }

    const fetchGymDetails = async () => {
        try {
            const res = await axios.get(`/api/gyms/${user.gym}`, {
                headers: { 'x-auth-token': token }
            })
            setGym(res.data)
            setOccupancy(res.data.currentOccupancy || 0)
            const isUserCheckedIn = res.data.activeCheckins?.some((c) => c.user._id === user._id)
            setCheckedIn(Boolean(isUserCheckedIn))
            setLoading(false)
        } catch (err) {
            console.error(err)
            setLoading(false)
        }
    }

    const handleSearch = async (e) => {
        const q = e.target.value
        setSearchQuery(q)
        if (q.length < 2) {
            setSearchResults([])
            return
        }
        try {
            const res = await axios.get(`/api/gyms?search=${encodeURIComponent(q)}`)
            setSearchResults(res.data || [])
        } catch (err) {
            console.error(err)
        }
    }

    const handleJoin = async (gymId, gymName) => {
        try {
            await axios.post(
                `/api/gyms/join/${gymId}`,
                {},
                { headers: { 'x-auth-token': token } }
            )
            await checkAuth()
            addToast({ message: `Joined ${gymName}`, type: 'success' })
        } catch (err) {
            console.error(err)
            addToast({ message: `Failed to join gym: ${err.message}`, type: 'error' })
        }
    }

    const handleCreate = async (e) => {
        e.preventDefault()
        try {
            await axios.post('/api/gyms', newGymData, {
                headers: { 'x-auth-token': token }
            })
            await checkAuth()
            setIsCreating(false)
            addToast({ message: `Created gym ${newGymData.name}`, type: 'success' })
        } catch (err) {
            console.error(err)
            addToast({ message: `Failed to register gym: ${err.message}`, type: 'error' })
        }
    }

    const handleCheckIn = async () => {
        const nextState = !checkedIn
        setCheckedIn(nextState)
        setOccupancy((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)))
        addToast({
            message: nextState ? 'Checked in to gym facility' : 'Checked out',
            type: 'info'
        })

        try {
            const res = await axios.post(
                '/api/gyms/checkin',
                {},
                { headers: { 'x-auth-token': token } }
            )
            if (res.data.status === 'checked_in') {
                setCheckedIn(true)
                setOccupancy(res.data.occupancy)
            } else {
                setCheckedIn(false)
                setOccupancy(res.data.occupancy)
            }
        } catch (err) {
            console.error(err)
            // Rollback
            setCheckedIn(!nextState)
            setOccupancy((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)))
            addToast({ message: `Check-in update failed: ${err.message}`, type: 'error' })
        }
    }

    if (loading) {
        return (
            <div style={{ padding: '32px', textAlign: 'center', color: '#71717a', fontSize: '0.875rem' }}>
                Loading Clan telemetry...
            </div>
        )
    }

    // CASE 1: No Gym Joined
    if (!user?.gym) {
        return (
            <div style={styles.container} className="gym-container">
                <header style={styles.header}>
                    <div style={styles.headerLeft}>
                        <h1>Gym Affiliation & Clans</h1>
                        <p style={styles.headerSub}>
                            Affiliate with your physical facility to compete on live rosters and view occupancy.
                        </p>
                    </div>
                </header>

                <div style={styles.grid} className="bento-grid">
                    {/* Search Panel */}
                    <div style={{ ...styles.card, gridColumn: 'span 7' }}>
                        <div style={styles.cardHeader}>
                            <div style={styles.iconBox}>
                                <Search size={16} color="#3b82f6" />
                            </div>
                            <div>
                                <h2>Search Facilities</h2>
                                <p style={styles.cardSub}>Search registered athletic gyms</p>
                            </div>
                        </div>

                        <input
                            type="text"
                            placeholder="Enter facility name or city..."
                            value={searchQuery}
                            onChange={handleSearch}
                            style={styles.input}
                        />

                        <div style={styles.scrollList}>
                            {searchResults.map((g) => (
                                <div key={g._id} style={styles.gymRow}>
                                    <div>
                                        <p style={styles.gymName}>{g.name}</p>
                                        <p style={styles.gymLocation}>
                                            <MapPin size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                            {g.location}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleJoin(g._id, g.name)}
                                        className="btn-primary"
                                        style={{ padding: '5px 12px', fontSize: '0.75rem' }}
                                    >
                                        Join Facility
                                    </button>
                                </div>
                            ))}
                            {searchResults.length === 0 && (
                                <p style={styles.emptyText}>
                                    {searchQuery ? 'No facilities matched search query.' : 'No facilities registered in directory.'}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Create Panel */}
                    <div style={{ ...styles.card, gridColumn: 'span 5' }}>
                        <div style={styles.cardHeader}>
                            <div style={styles.iconBox}>
                                <PlusCircle size={16} color="#3b82f6" />
                            </div>
                            <div>
                                <h2>Register Facility</h2>
                                <p style={styles.cardSub}>Found a new training facility clan</p>
                            </div>
                        </div>

                        {!isCreating ? (
                            <div style={{ textAlign: 'center', padding: '24px 0' }}>
                                <p style={{ color: '#71717a', fontSize: '0.8125rem', marginBottom: '14px' }}>
                                    Your facility not listed? Register it to create a community roster.
                                </p>
                                <button
                                    onClick={() => setIsCreating(true)}
                                    className="btn-secondary"
                                    style={{ width: '100%' }}
                                >
                                    Create Facility Clan
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <input
                                    placeholder="Gym Facility Name"
                                    style={styles.input}
                                    value={newGymData.name}
                                    onChange={(e) => setNewGymData({ ...newGymData, name: e.target.value })}
                                    required
                                />
                                <input
                                    placeholder="Location (City, State)"
                                    style={styles.input}
                                    value={newGymData.location}
                                    onChange={(e) => setNewGymData({ ...newGymData, location: e.target.value })}
                                    required
                                />
                                <input
                                    placeholder="Description (Optional)"
                                    style={styles.input}
                                    value={newGymData.description}
                                    onChange={(e) => setNewGymData({ ...newGymData, description: e.target.value })}
                                />
                                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setIsCreating(false)}
                                        className="btn-secondary"
                                        style={{ padding: '6px 12px', fontSize: '0.8125rem' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        style={{ flex: 1, padding: '6px 12px', fontSize: '0.8125rem' }}
                                    >
                                        Register
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    // CASE 2: Gym Joined -> Live Dashboard
    return (
        <div style={styles.container} className="gym-container">
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <h1>{gym?.name}</h1>
                    <p style={styles.headerSub}>
                        <MapPin size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        {gym?.location}
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {confirmingLeave ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                                onClick={handleLeave}
                                style={styles.confirmLeaveBtn}
                            >
                                Confirm Leave
                            </button>
                            <button
                                onClick={() => setConfirmingLeave(false)}
                                className="btn-secondary"
                                style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setConfirmingLeave(true)}
                            style={styles.leaveBtn}
                        >
                            Leave Facility
                        </button>
                    )}

                    <button
                        onClick={handleCheckIn}
                        className={checkedIn ? 'btn-secondary' : 'btn-primary'}
                        style={{ padding: '6px 14px', fontSize: '0.8125rem' }}
                    >
                        {checkedIn ? (
                            <>
                                <LogOut size={14} /> Check Out
                            </>
                        ) : (
                            <>
                                <LogIn size={14} /> Check In
                            </>
                        )}
                    </button>
                </div>
            </header>

            <div style={styles.grid} className="bento-grid">
                {/* Live Occupancy Metric */}
                <div style={{ ...styles.card, gridColumn: 'span 4', textAlign: 'center', alignItems: 'center' }}>
                    <div style={styles.pulseBadge}>
                        <Activity size={20} color="#10b981" />
                    </div>
                    <span style={styles.metricBig} className="tabular-nums">
                        {occupancy}
                    </span>
                    <span style={styles.metricLabel}>Active Athletes Checked In</span>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '16px', flexWrap: 'wrap' }}>
                        {gym?.activeCheckins && gym.activeCheckins.length > 0 ? (
                            gym.activeCheckins.map((c, i) => (
                                <div
                                    key={i}
                                    onClick={() => handleViewProfile(c.user?._id)}
                                    style={styles.liveAvatar}
                                    title={c.user?.name}
                                >
                                    {(c.user?.name?.[0] || 'A').toUpperCase()}
                                </div>
                            ))
                        ) : (
                            <span style={{ fontSize: '0.75rem', color: '#71717a' }}>
                                Facility is currently clear.
                            </span>
                        )}
                    </div>
                </div>

                {/* Clan Roster */}
                <div style={{ ...styles.card, gridColumn: 'span 8' }}>
                    <div style={styles.cardHeader}>
                        <div style={styles.iconBox}>
                            <Users size={16} color="#3b82f6" />
                        </div>
                        <div>
                            <h2>Facility Roster ({gym?.members?.length || 0})</h2>
                            <p style={styles.cardSub}>Registered members</p>
                        </div>
                    </div>

                    <div style={styles.scrollList}>
                        {gym?.members?.map((m) => {
                            const isPresent = gym.activeCheckins?.some((c) => c.user?._id === m._id)
                            return (
                                <div
                                    key={m._id}
                                    style={styles.memberRow}
                                    onClick={() => handleViewProfile(m._id)}
                                >
                                    <div style={styles.miniAvatar}>
                                        {(m.name?.[0] || 'A').toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <span style={styles.memberName}>{m.name}</span>
                                    </div>
                                    {isPresent && (
                                        <span style={styles.presentBadge}>In Gym</span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {selectedMember && (
                <FriendProfileModal
                    friend={selectedMember}
                    onClose={() => setSelectedMember(null)}
                />
            )}
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
    input: {
        width: '100%',
        backgroundColor: '#18181b',
        border: '1px solid #27272a',
        color: '#f4f4f5',
        borderRadius: '6px',
        padding: '8px 12px',
        fontSize: '0.8125rem'
    },
    scrollList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxHeight: '320px',
        overflowY: 'auto'
    },
    emptyText: {
        fontSize: '0.8125rem',
        color: '#71717a',
        padding: '16px 0',
        textAlign: 'center'
    },
    gymRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 12px',
        backgroundColor: '#18181b',
        border: '1px solid #27272a',
        borderRadius: '6px'
    },
    gymName: {
        fontSize: '0.8125rem',
        fontWeight: 500,
        color: '#f4f4f5',
        margin: 0
    },
    gymLocation: {
        fontSize: '0.75rem',
        color: '#71717a',
        margin: 0
    },
    leaveBtn: {
        background: 'transparent',
        border: 'none',
        color: '#ef4444',
        fontSize: '0.8125rem',
        cursor: 'pointer',
        padding: '6px 10px'
    },
    confirmLeaveBtn: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        border: '1px solid #ef4444',
        color: '#ef4444',
        fontSize: '0.75rem',
        padding: '6px 10px',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    pulseBadge: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '10px'
    },
    metricBig: {
        fontSize: '2rem',
        fontWeight: 600,
        color: '#f4f4f5',
        lineHeight: 1
    },
    metricLabel: {
        fontSize: '0.75rem',
        color: '#71717a',
        marginTop: '6px',
        textTransform: 'uppercase',
        letterSpacing: '0.04em'
    },
    liveAvatar: {
        width: '28px',
        height: '28px',
        borderRadius: '4px',
        backgroundColor: '#27272a',
        border: '1px solid #3f3f46',
        color: '#10b981',
        fontSize: '0.75rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
    },
    memberRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 12px',
        backgroundColor: '#18181b',
        border: '1px solid #27272a',
        borderRadius: '6px',
        cursor: 'pointer'
    },
    miniAvatar: {
        width: '28px',
        height: '28px',
        borderRadius: '4px',
        backgroundColor: '#27272a',
        color: '#f4f4f5',
        fontSize: '0.75rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    memberName: {
        fontSize: '0.8125rem',
        fontWeight: 500,
        color: '#f4f4f5'
    },
    presentBadge: {
        fontSize: '0.6875rem',
        color: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        padding: '2px 6px',
        borderRadius: '3px'
    }
}

export default MyGym
