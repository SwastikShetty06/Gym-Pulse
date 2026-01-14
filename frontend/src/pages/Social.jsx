import { useState, useEffect } from 'react'
import axios from 'axios'
import { Search, UserPlus, UserMinus, Check, X, Users, Zap, TrendingUp, Award, BarChart2, Flame, Copy, ChevronDown, ChevronUp } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuthStore } from '../store/authStore'
import FriendProfileModal from '../components/FriendProfileModal'

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
                <FriendProfileModal
                    friend={selectedFriend}
                    onClose={() => setSelectedFriend(null)}
                />
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


}

export default Social
