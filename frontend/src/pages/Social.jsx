import { useState, useEffect } from 'react'
import axios from 'axios'
import { Search, UserPlus, UserMinus, Check, X, Users, Zap, TrendingUp, Award, BarChart2, Flame, Copy, ChevronDown, ChevronUp } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuthStore } from '../store/authStore'

const Social = () => {
    const { token, user: currentUser } = useAuthStore()
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [network, setNetwork] = useState({ friends: [], followers: [], following: [], requests: [] })
    const [selectedFriend, setSelectedFriend] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchNetwork()
    }, [token])

    const fetchNetwork = async () => {
        try {
            const res = await axios.get('/api/social/network', { headers: { 'x-auth-token': token } })
            setNetwork(res.data)
        } catch (err) {
            console.error(err)
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
            const res = await axios.get(`/api/social/search?q=${q}`, { headers: { 'x-auth-token': token } })
            setSearchResults(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    const sendRequest = async (id) => {
        try {
            await axios.post(`/api/social/request/${id}`, {}, { headers: { 'x-auth-token': token } })
            fetchNetwork()
            // Update search results to show pending
            setSearchResults(prev => prev.map(u => u._id === id ? { ...u, pending: true } : u))
        } catch (err) {
            console.error(err)
        }
    }

    const respondRequest = async (id, action) => {
        try {
            await axios.put(`/api/social/respond/${id}`, { action }, { headers: { 'x-auth-token': token } })
            fetchNetwork()
        } catch (err) {
            console.error(err)
        }
    }

    const toggleFollow = async (id) => {
        try {
            await axios.post(`/api/social/follow/${id}`, {}, { headers: { 'x-auth-token': token } })
            fetchNetwork()
        } catch (err) {
            console.error(err)
        }
    }

    const viewFriendProfile = async (id) => {
        setLoading(true)
        try {
            const res = await axios.get(`/api/social/profile/${id}`, { headers: { 'x-auth-token': token } })
            setSelectedFriend(res.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const [expandedDay, setExpandedDay] = useState(null)

    const copySchedule = async (daySchedule) => {
        try {
            await axios.post('/api/schedule', {
                day: daySchedule.day,
                exercises: daySchedule.exercises
            }, { headers: { 'x-auth-token': token } })
            alert(`Copied ${daySchedule.day}'s workout to your schedule!`)
        } catch (err) {
            console.error(err)
            alert('Failed to copy schedule')
        }
    }

    const copyFullSchedule = async () => {
        if (!selectedFriend.schedule || selectedFriend.schedule.length === 0) return;
        if (!window.confirm(`Are you sure you want to copy ${selectedFriend.user.name}'s entire weekly schedule to yours? This will update your existing days.`)) return;

        try {
            await axios.post('/api/schedule/bulk', {
                schedules: selectedFriend.schedule
            }, { headers: { 'x-auth-token': token } })
            alert(`Successfully copied ${selectedFriend.user.name}'s weekly routine!`)
        } catch (err) {
            console.error(err)
            alert('Failed to copy schedule')
        }
    }

    return (
        <div className="social-container" style={styles.container}>
            <header style={styles.header}>
                <h1 style={{ fontSize: '3rem' }}>Social <span className="gradient-text">Hub</span></h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Connect, compete, and grow with the elite.</p>
            </header>

            <div className="bento-grid" style={styles.grid}>
                {/* Search Panel - Span 7 */}
                <div className="glass hover-lift" style={{ ...styles.card, gridColumn: 'span 7' }}>
                    <div style={styles.cardHeader}>
                        <div style={styles.iconBox}>
                            <Search size={20} color="var(--accent-primary)" />
                        </div>
                        <h3 style={{ marginLeft: '1rem' }}>Find Recruits</h3>
                    </div>

                    <div style={styles.searchWrapper}>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={handleSearch}
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.scrollList}>
                        {searchResults.length === 0 && searchQuery.length >= 2 && (
                            <p style={styles.emptyText}>No users found. Try another name.</p>
                        )}
                        {searchResults.map(user => (
                            <div key={user._id} style={styles.userRow}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={styles.miniAvatar}>{user.name[0]}</div>
                                    <div>
                                        <p style={{ fontWeight: 700 }}>{user.name}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.email}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => sendRequest(user._id)}
                                        disabled={user.pending || network.friends.some(f => f._id === user._id)}
                                        style={{ ...styles.actionBtn, background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)' }}
                                    >
                                        <UserPlus size={16} />
                                        <span>{user.pending ? 'Pending' : 'Invite'}</span>
                                    </button>
                                    <button
                                        onClick={() => toggleFollow(user._id)}
                                        style={{ ...styles.actionBtn, background: 'rgba(168, 85, 247, 0.1)', color: 'var(--accent-secondary)' }}
                                    >
                                        <TrendingUp size={16} />
                                        <span>Follow</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Requests Panel - Span 5 */}
                <div className="glass hover-lift" style={{ ...styles.card, gridColumn: 'span 5' }}>
                    <div style={styles.cardHeader}>
                        <div style={styles.iconBox}>
                            <Zap size={20} color="var(--accent-secondary)" />
                        </div>
                        <h3 style={{ marginLeft: '1rem' }}>Incoming Requests</h3>
                    </div>
                    <div style={styles.scrollList}>
                        {network.requests.filter(r => r.type === 'incoming' && r.status === 'pending').length === 0 ? (
                            <p style={styles.emptyText}>No pending requests.</p>
                        ) : (
                            network.requests.filter(r => r.type === 'incoming' && r.status === 'pending').map(req => (
                                <div key={req._id} style={styles.userRow}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={styles.miniAvatar}>{req.user.name[0]}</div>
                                        <p style={{ fontWeight: 600 }}>{req.user.name}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => respondRequest(req.user._id, 'accepted')} style={styles.circleBtnSuccess}>
                                            <Check size={16} />
                                        </button>
                                        <button onClick={() => respondRequest(req.user._id, 'rejected')} style={styles.circleBtnDanger}>
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Network Panel - Span 12 */}
                <div className="glass hover-lift" style={{ ...styles.card, gridColumn: 'span 12' }}>
                    <div style={styles.cardHeader}>
                        <div style={styles.iconBox}>
                            <Users size={20} color="var(--accent-primary)" />
                        </div>
                        <h3 style={{ marginLeft: '1rem' }}>My Network</h3>
                    </div>

                    <div style={styles.networkTabs}>
                        <div style={styles.tabSection}>
                            <p style={styles.tabLabel}>Recruits ({network.friends.length})</p>
                            <div style={styles.horizontalScroll}>
                                {network.friends.map(friend => (
                                    <div key={friend._id} className="glass hover-lift" style={styles.networkCard} onClick={() => viewFriendProfile(friend._id)}>
                                        <div style={styles.avatarGlow}>{friend.name[0]}</div>
                                        <p style={{ fontWeight: 700, fontSize: '0.9rem', marginTop: '0.75rem' }}>{friend.name}</p>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Friend</p>
                                    </div>
                                ))}
                                {network.friends.length === 0 && <p style={styles.emptyText}>Add friends to see them here.</p>}
                            </div>
                        </div>

                        <div style={styles.tabSection}>
                            <p style={styles.tabLabel}>Following ({network.following.length})</p>
                            <div style={styles.horizontalScroll}>
                                {network.following.map(user => (
                                    <div key={user._id} className="glass hover-lift" style={styles.networkCard} onClick={() => viewFriendProfile(user._id)}>
                                        <div style={{ ...styles.avatarGlow, background: 'linear-gradient(135deg, var(--accent-secondary), #d946ef)' }}>{user.name[0]}</div>
                                        <p style={{ fontWeight: 700, fontSize: '0.9rem', marginTop: '0.75rem' }}>{user.name}</p>
                                        <button onClick={(e) => { e.stopPropagation(); toggleFollow(user._id); }} style={styles.unfollowTxt}>Unfollow</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={styles.tabSection}>
                            <p style={styles.tabLabel}>Followers ({network.followers.length})</p>
                            <div style={styles.horizontalScroll}>
                                {network.followers.map(user => (
                                    <div key={user._id} className="glass hover-lift" style={styles.networkCard} onClick={() => viewFriendProfile(user._id)}>
                                        <div style={{ ...styles.avatarGlow, background: 'linear-gradient(135deg, #10b981, #34d399)' }}>{user.name[0]}</div>
                                        <p style={{ fontWeight: 700, fontSize: '0.9rem', marginTop: '0.75rem' }}>{user.name}</p>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Follower</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Friend Profile Modal */}
            {selectedFriend && (
                <div style={styles.modalOverlay} onClick={() => setSelectedFriend(null)}>
                    <div className="glass radial-glow" style={{ ...styles.modalContent, overflowY: 'auto', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
                        <button style={styles.closeBtn} onClick={() => setSelectedFriend(null)}><X size={24} /></button>

                        <div style={styles.modalHeader}>
                            <div style={styles.largeAvatar}>{selectedFriend.user.name[0]}</div>
                            <div>
                                <h2 style={{ fontSize: '2rem' }}>{selectedFriend.user.name}</h2>
                                <p style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Elite Performance Profile</p>
                            </div>
                        </div>

                        <div style={styles.modalStats} className="modal-stats-mobile">
                            <div style={styles.miniStat} className="mini-stat-mobile">
                                <Flame size={24} color="#f97316" />
                                <div>
                                    <p style={styles.statLabel}>Streak</p>
                                    <p style={styles.statValue}>{selectedFriend.streak || 0} Days</p>
                                </div>
                            </div>
                            <div style={styles.miniStat} className="mini-stat-mobile">
                                <BarChart2 size={24} color="var(--success)" />
                                <div>
                                    <p style={styles.statLabel}>Total PRs</p>
                                    <p style={styles.statValue}>{selectedFriend.prs.length}</p>
                                </div>
                            </div>
                            <div style={styles.miniStat} className="mini-stat-mobile">
                                <Zap size={24} color="var(--accent-secondary)" />
                                <div>
                                    <p style={styles.statLabel}>Consistency</p>
                                    <p style={styles.statValue}>
                                        {selectedFriend.consistency || 0}%
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Weekly Schedule Detailed */}
                        <div style={{ marginTop: '2.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Weekly Training Split</p>
                                {selectedFriend.schedule && selectedFriend.schedule.length > 0 && (
                                    <button
                                        onClick={copyFullSchedule}
                                        style={{
                                            padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
                                            background: 'linear-gradient(135deg, var(--accent-primary), #4f46e5)', color: 'white',
                                            fontSize: '0.8.5rem', fontWeight: 600, cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                                        }}>
                                        <Copy size={16} />
                                        <span>Copy Full Week</span>
                                    </button>
                                )}
                            </div>

                            {selectedFriend.schedule && selectedFriend.schedule.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                                        const daySched = selectedFriend.schedule.find(s => s.day === day);
                                        const isExpanded = expandedDay === day;

                                        if (!daySched) return null;

                                        return (
                                            <div key={day} style={{
                                                padding: '1rem', borderRadius: '12px',
                                                background: 'rgba(255,255,255,0.02)',
                                                border: '1px solid var(--glass-border)',
                                                cursor: 'pointer'
                                            }} onClick={() => setExpandedDay(isExpanded ? null : day)}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="schedule-row-mobile">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        {isExpanded ? <ChevronUp size={18} color="var(--accent-primary)" /> : <ChevronDown size={18} color="var(--text-secondary)" />}
                                                        <div>
                                                            <p style={{ fontWeight: 700 }}>{day}</p>
                                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{daySched.exercises.length} Exercises</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); copySchedule(daySched); }}
                                                        style={{
                                                            padding: '0.4rem 0.8rem', borderRadius: '8px', border: 'none',
                                                            background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)',
                                                            fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
                                                        }}>
                                                        Copy to Mine
                                                    </button>
                                                </div>

                                                {isExpanded && (
                                                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                                                        {daySched.exercises.map((ex, i) => (
                                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                                                <span style={{ color: 'var(--text-primary)' }}>{ex.name}</span>
                                                                <span style={{ color: 'var(--text-secondary)' }}>{ex.sets} x {ex.reps}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No schedule public.</p>
                            )}
                        </div>

                        {/* Chart in Modal */}
                        <div style={{ height: '200px', width: '100%', marginTop: '2.5rem' }}>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Workout Volume</p>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={selectedFriend.attendance.slice(0, 14).reverse().map(a => ({
                                    date: new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                                    duration: a.duration
                                }))}>
                                    <defs>
                                        <linearGradient id="colorFriend" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" hide />
                                    <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: 'none', borderRadius: '8px' }} itemStyle={{ color: 'white' }} />
                                    <Area type="monotone" dataKey="duration" stroke="var(--accent-primary)" fill="url(#colorFriend)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div style={styles.prScroller}>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Personal Records Vault</p>
                            <div className="pr-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                                {selectedFriend.prs.map(pr => (
                                    <div key={pr._id} style={{ ...styles.modalPrRow, border: '1px solid var(--glass-border)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                                        <div>
                                            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{pr.exercise}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(pr.date).toLocaleDateString()}</p>
                                        </div>
                                        <p style={{ fontWeight: 800, color: 'var(--accent-primary)', fontSize: '1.25rem' }}>{pr.weight}<span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '2px' }}>kg</span></p>
                                    </div>
                                ))}
                                {selectedFriend.prs.length === 0 && <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', gridColumn: 'span 2' }}>No records yet.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const styles = {
    container: {
        padding: '3rem 2rem',
        minHeight: '100vh',
        maxWidth: '1400px',
        margin: '0 auto'
    },
    header: { marginBottom: '3rem' },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gridAutoRows: 'minmax(140px, auto)',
        gap: '1.5rem'
    },
    card: { padding: '2rem', display: 'flex', flexDirection: 'column' },
    cardHeader: { display: 'flex', alignItems: 'center', marginBottom: '1.5rem' },
    iconBox: {
        width: '40px', height: '40px', borderRadius: '10px',
        background: 'rgba(255, 255, 255, 0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid var(--glass-border)'
    },
    searchWrapper: { marginBottom: '1.5rem' },
    input: {
        width: '100%', background: 'rgba(0,0,0,0.2)',
        border: '1px solid var(--glass-border)',
        borderRadius: '12px', color: 'white', padding: '1rem',
        fontSize: '1rem', outline: 'none'
    },
    scrollList: { display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' },
    userRow: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1rem', background: 'rgba(255,255,255,0.02)',
        borderRadius: '16px', border: '1px solid var(--glass-border)'
    },
    miniAvatar: {
        width: '40px', height: '40px', borderRadius: '12px',
        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800
    },
    actionBtn: {
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.5rem 1rem', borderRadius: '10px', border: 'none',
        fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer'
    },
    circleBtnSuccess: {
        width: '36px', height: '36px', borderRadius: '50%', border: 'none',
        background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
    },
    circleBtnDanger: {
        width: '36px', height: '36px', borderRadius: '50%', border: 'none',
        background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
    },
    networkTabs: { display: 'flex', flexDirection: 'column', gap: '2rem' },
    tabLabel: { fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '1rem' },
    horizontalScroll: { display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' },
    networkCard: {
        minWidth: '120px', padding: '1.5rem 1rem', textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer',
        transition: 'transform 0.2s ease'
    },
    avatarGlow: {
        width: '50px', height: '50px', borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800,
        boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
    },
    unfollowTxt: { background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.7rem', marginTop: '0.5rem', cursor: 'pointer' },
    emptyText: { color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' },

    // Modal Styles
    modalOverlay: {
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
        zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
    },
    modalContent: {
        width: '100%', maxWidth: '500px', padding: '3rem 2rem', position: 'relative',
        borderRadius: '24px', border: '1px solid var(--glass-border)'
    },
    closeBtn: { position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer' },
    modalHeader: { display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' },
    largeAvatar: {
        width: '80px', height: '80px', borderRadius: '24px',
        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 900
    },
    modalStats: { display: 'flex', gap: '2rem', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '20px' },
    miniStat: { display: 'flex', alignItems: 'center', gap: '1rem' },
    statValue: { fontSize: '1.25rem', fontWeight: 800 },
    prScroller: { marginTop: '2.5rem' },
    modalPrRow: {
        display: 'flex', justifyContent: 'space-between', padding: '1rem',
        borderBottom: '1px solid var(--glass-border)'
    }
}

// Inject mobile styles
if (typeof window !== 'undefined') {
    const styleSheet = document.createElement("style")
    styleSheet.innerText = `
        @media (max-width: 1024px) {
            .social-container .bento-grid { grid-template-columns: repeat(2, 1fr) !important; }
            .social-container .bento-grid > div { grid-column: span 2 !important; }
        }
        @media (max-width: 768px) {
            .social-container { padding: 1.5rem 1rem !important; padding-bottom: 90px !important; }
            .social-container h1 { font-size: 2.2rem !important; }
            .social-container .bento-grid { grid-template-columns: 1fr !important; }
            .social-container .bento-grid > div { grid-column: span 1 !important; }
            
            /* Modal Mobile Styles */
            .social-container .glass.radial-glow { 
                width: 95% !important; 
                max-height: 85vh !important; 
                overflow-y: auto !important; 
                padding: 1.25rem !important;
            }
            /* Stats Grid for Mobile */
            .modal-stats-mobile {
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
                gap: 0.75rem !important;
                padding: 1rem !important;
            }
            .modal-stats-mobile > div:last-child {
                grid-column: span 2 !important;
            }
            .mini-stat-mobile {
                flex-direction: column !important;
                align-items: flex-start !important;
                gap: 0.5rem !important;
                background: rgba(255,255,255,0.03);
                padding: 0.75rem;
                border-radius: 12px;
            }
            /* Schedule Row Mobile */
            .schedule-row-mobile {
                flex-direction: column !important;
                align-items: flex-start !important;
                gap: 0.75rem !important;
            }
            .schedule-row-mobile button {
                width: 100% !important;
                text-align: center !important;
            }
        }
    `
    document.head.appendChild(styleSheet)
}

export default Social
