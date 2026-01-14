import { useState, useEffect } from 'react' // eslint-disable-line no-unused-vars
import axios from 'axios'
import { MapPin, Users, Activity, LogIn, LogOut, Search, PlusCircle, ArrowRight, X } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import FriendProfileModal from '../components/FriendProfileModal'

const MyGym = () => {
    const { token, user, checkAuth } = useAuthStore()
    const [gym, setGym] = useState(null)
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [isCreating, setIsCreating] = useState(false)
    const [newGymData, setNewGymData] = useState({ name: '', location: '', description: '' })
    const [checkedIn, setCheckedIn] = useState(false)
    const [occupancy, setOccupancy] = useState(0)
    const [selectedMember, setSelectedMember] = useState(null)

    // ... (useEffect and fetchGymDetails remain)

    const handleViewProfile = async (memberId) => {
        try {
            const res = await axios.get(`/api/social/profile/${memberId}`, { headers: { 'x-auth-token': token } })
            setSelectedMember(res.data)
        } catch (err) {
            console.error(err)
            alert('Failed to load profile')
        }
    }

    const handleLeave = async () => {
        if (!window.confirm('Are you sure you want to leave this gym? You will lose your Clan membership.')) return
        try {
            await axios.post('/api/gyms/leave', {}, { headers: { 'x-auth-token': token } })
            await checkAuth()
        } catch (err) {
            console.error(err)
            alert('Failed to leave gym')
        }
    }

    useEffect(() => {
        if (user && user.gym) {
            fetchGymDetails()
        } else {
            setLoading(false)
        }
    }, [user])

    const fetchGymDetails = async () => {
        try {
            const res = await axios.get(`/api/gyms/${user.gym}`, { headers: { 'x-auth-token': token } })
            setGym(res.data)
            setOccupancy(res.data.currentOccupancy)
            // Check if user is currently checked in
            const isUserCheckedIn = res.data.activeCheckins.some(c => c.user._id === user._id)
            setCheckedIn(isUserCheckedIn)
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
            const res = await axios.get(`/api/gyms?search=${q}`)
            setSearchResults(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    const handleJoin = async (gymId) => {
        try {
            await axios.post(`/api/gyms/join/${gymId}`, {}, { headers: { 'x-auth-token': token } })
            await checkAuth() // Refresh user data to update gym ID
        } catch (err) {
            console.error(err)
            alert('Failed to join gym')
        }
    }

    const handleCreate = async (e) => {
        e.preventDefault()
        try {
            await axios.post('/api/gyms', newGymData, { headers: { 'x-auth-token': token } })
            await checkAuth()
            setIsCreating(false)
        } catch (err) {
            console.error(err)
            alert('Failed to create gym')
        }
    }

    const handleCheckIn = async () => {
        try {
            const res = await axios.post('/api/gyms/checkin', {}, { headers: { 'x-auth-token': token } })
            if (res.data.status === 'checked_in') {
                setCheckedIn(true)
                setOccupancy(res.data.occupancy)
            } else {
                setCheckedIn(false)
                setOccupancy(res.data.occupancy)
            }
        } catch (err) {
            console.error(err)
            alert('Check-in failed')
        }
    }

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading your Clan...</div>

    // CASE 1: No Gym Joined -> Show Search or Create
    if (!user?.gym) {
        return (
            <div className="gym-container" style={styles.container}>
                <header style={styles.header}>
                    <h1 style={{ fontSize: '3rem' }}>Find Your <span className="gradient-text">Clan</span></h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Join your real-world gym to dominate the leadeboard.</p>
                </header>

                <div className="bento-grid" style={styles.grid}>
                    {/* Search Panel */}
                    <div className="glass hover-lift" style={{ ...styles.card, gridColumn: 'span 7' }}>
                        <div style={styles.cardHeader}>
                            <div style={styles.iconBox}><Search size={20} color="var(--accent-primary)" /></div>
                            <h3 style={{ marginLeft: '1rem' }}>Search Local Gyms</h3>
                        </div>
                        <input
                            type="text"
                            placeholder="Enter gym name or city..."
                            value={searchQuery}
                            onChange={handleSearch}
                            style={styles.input}
                        />
                        <div style={styles.scrollList}>
                            {searchResults.map(g => (
                                <div key={g._id} style={styles.gymRow}>
                                    <div>
                                        <p style={{ fontWeight: 700 }}>{g.name}</p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}><MapPin size={12} style={{ marginRight: '4px' }} />{g.location}</p>
                                    </div>
                                    <button onClick={() => handleJoin(g._id)} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                                        Join
                                    </button>
                                </div>
                            ))}
                            {searchResults.length === 0 && searchQuery.length > 1 && <p style={styles.emptyText}>No gyms found.</p>}
                        </div>
                    </div>

                    {/* Create Panel */}
                    <div className="glass hover-lift" style={{ ...styles.card, gridColumn: 'span 5', background: 'rgba(99, 102, 241, 0.05)' }}>
                        <div style={styles.cardHeader}>
                            <div style={styles.iconBox}><PlusCircle size={20} color="var(--accent-secondary)" /></div>
                            <h3 style={{ marginLeft: '1rem' }}>Register New Gym</h3>
                        </div>
                        {!isCreating ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Can't find your gym? Be the founder.</p>
                                <button onClick={() => setIsCreating(true)} className="btn-primary" style={{ width: '100%' }}>Create Gym Clan</button>
                            </div>
                        ) : (
                            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input placeholder="Gym Name (e.g. Gold's Gym)" style={styles.input} value={newGymData.name} onChange={e => setNewGymData({ ...newGymData, name: e.target.value })} required />
                                <input placeholder="Location (City, State)" style={styles.input} value={newGymData.location} onChange={e => setNewGymData({ ...newGymData, location: e.target.value })} required />
                                <input placeholder="Description (Optional)" style={styles.input} value={newGymData.description} onChange={e => setNewGymData({ ...newGymData, description: e.target.value })} />
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button type="button" onClick={() => setIsCreating(false)} style={styles.cancelBtn}>Cancel</button>
                                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>Launch</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    // CASE 2: Gym Joined -> Show Dashboard
    return (
        <div className="gym-container" style={styles.container}>
            <header style={styles.header}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '3rem' }}>{gym?.name}</h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MapPin size={16} color="var(--accent-secondary)" /> {gym?.location}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={handleLeave} style={styles.leaveBtn}>
                            Leave Clan
                        </button>
                        <button onClick={handleCheckIn} className={checkedIn ? "glass" : "btn-primary"} style={checkedIn ? styles.checkOutBtn : styles.checkInBtn}>
                            {checkedIn ? <><LogOut size={20} /> Check Out</> : <><LogIn size={20} /> Check In Now</>}
                        </button>
                    </div>
                </div>
            </header>

            <div className="bento-grid" style={styles.grid}>
                {/* Live Occupancy - Span 4 */}
                <div className="glass hover-lift radial-glow" style={{ ...styles.card, gridColumn: 'span 4', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <div style={styles.pulseRing}>
                        <Activity size={40} color="var(--success)" />
                    </div>
                    <h2 style={{ fontSize: '3rem', fontWeight: 800, margin: '1rem 0' }}>{occupancy}</h2>
                    <p style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.8rem', marginBottom: '1rem' }}>Live Members</p>

                    {/* Live Avatars */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '-10px', flexWrap: 'wrap', maxWidth: '100%' }}>
                        {gym?.activeCheckins && gym.activeCheckins.length > 0 ? (
                            gym.activeCheckins.map((c, i) => (
                                <div
                                    key={i}
                                    onClick={() => handleViewProfile(c.user._id)}
                                    style={{ ...styles.liveAvatar, zIndex: 10 - i, transform: `translateX(${-10 * i}px)` }}
                                    title={c.user.name}
                                >
                                    {c.user.name ? c.user.name[0] : '?'}
                                </div>
                            ))
                        ) : (
                            <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                                Be the first to check in.
                            </p>
                        )}
                    </div>
                </div>

                {/* Gym Info / Description - Span 8 */}
                <div className="glass hover-lift" style={{ ...styles.card, gridColumn: 'span 8' }}>
                    <div style={styles.cardHeader}>
                        <div style={styles.iconBox}><Users size={20} color="var(--accent-primary)" /></div>
                        <h3 style={{ marginLeft: '1rem' }}>Clan Roster ({gym?.members?.length})</h3>
                    </div>
                    <div style={styles.scrollList}>
                        {gym?.members?.map(m => (
                            <div
                                key={m._id}
                                style={{ ...styles.memberRow, cursor: 'pointer' }}
                                onClick={() => handleViewProfile(m._id)}
                            >
                                <div style={styles.miniAvatar}>{m.name[0]}</div>
                                <p style={{ fontWeight: 600 }}>{m.name}</p>
                                {gym.activeCheckins.some(c => c.user._id === m._id) && (
                                    <span style={styles.onlineBadge}>● In Gym</span>
                                )}
                            </div>
                        ))}
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
    container: { padding: '3rem 2rem', minHeight: '100vh', maxWidth: '1400px', margin: '0 auto' },
    header: { marginBottom: '3rem' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem', gridAutoRows: 'minmax(180px, auto)' },
    card: { padding: '2rem', display: 'flex', flexDirection: 'column' },
    cardHeader: { display: 'flex', alignItems: 'center', marginBottom: '1.5rem' },
    iconBox: { width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' },
    input: { width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', padding: '1rem', fontSize: '1rem', outline: 'none' },
    gymRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' },
    emptyText: { color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center', marginTop: '1rem' },
    cancelBtn: { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.8rem 1.5rem', cursor: 'pointer' },
    checkInBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem', fontSize: '1.1rem' },
    checkOutBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem', fontSize: '1.1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)' },
    leaveBtn: { background: 'transparent', color: 'var(--danger)', border: 'none', padding: '0 1rem', cursor: 'pointer', fontSize: '0.9rem' },
    pulseRing: { width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' },
    scrollList: { display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' },
    memberRow: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', transition: 'background 0.2s' },
    miniAvatar: { width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
    liveAvatar: { width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--success), #34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: '2px solid var(--bg-primary)', cursor: 'pointer' },
    onlineBadge: { marginLeft: 'auto', color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600 }
}

export default MyGym
