import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import {
    Search,
    UserPlus,
    Check,
    X,
    Users,
    Zap,
    UserCheck,
    ArrowUpRight
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'
import FriendProfileModal from '../components/FriendProfileModal'

export const Social = () => {
    const { token } = useAuthStore()
    const { addToast } = useToastStore()
    const [searchParams, setSearchParams] = useSearchParams()

    // URL as Single Source of Truth for search query
    const searchQuery = searchParams.get('search') || ''

    const [searchResults, setSearchResults] = useState([])
    const [network, setNetwork] = useState({ friends: [], requests: [] })
    const [selectedFriend, setSelectedFriend] = useState(null)
    const [loadingProfile, setLoadingProfile] = useState(false)
    const [searching, setSearching] = useState(false)

    useEffect(() => {
        fetchNetwork()
    }, [token])

    const fetchNetwork = async () => {
        try {
            const res = await axios.get('/api/social/network', {
                headers: { 'x-auth-token': token }
            })
            setNetwork(res.data || { friends: [], requests: [] })
        } catch (err) {
            console.error(err)
            addToast({ message: `Network sync failed: ${err.message}`, type: 'error' })
        }
    }

    // Search synchronizer
    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSearchResults([])
            return
        }

        const timer = setTimeout(async () => {
            setSearching(true)
            try {
                const res = await axios.get(`/api/social/search?q=${encodeURIComponent(searchQuery)}`, {
                    headers: { 'x-auth-token': token }
                })
                setSearchResults(res.data || [])
            } catch (err) {
                console.error(err)
            } finally {
                setSearching(false)
            }
        }, 150)

        return () => clearTimeout(timer)
    }, [searchQuery, token])

    const handleSearchInput = (e) => {
        const val = e.target.value
        if (val) {
            setSearchParams({ search: val })
        } else {
            setSearchParams({})
        }
    }

    // Send friend request with optimistic feedback
    const sendRequest = async (id, name) => {
        // Optimistic UI update
        setSearchResults(prev =>
            prev.map(u => (u._id === id ? { ...u, pending: true } : u))
        )
        addToast({ message: `Request dispatched to ${name}`, type: 'success' })

        try {
            await axios.post(
                `/api/social/request/${id}`,
                {},
                { headers: { 'x-auth-token': token } }
            )
            fetchNetwork()
        } catch (err) {
            // Rollback
            setSearchResults(prev =>
                prev.map(u => (u._id === id ? { ...u, pending: false } : u))
            )
            addToast({
                message: `Failed to send request: ${err.message}`,
                type: 'error'
            })
        }
    }

    // Respond to request
    const respondRequest = async (id, action, name) => {
        addToast({
            message: `Request ${action} for ${name}`,
            type: action === 'accepted' ? 'success' : 'info'
        })

        try {
            await axios.put(
                `/api/social/respond/${id}`,
                { action },
                { headers: { 'x-auth-token': token } }
            )
            fetchNetwork()
        } catch (err) {
            addToast({
                message: `Action failed: ${err.message}`,
                type: 'error'
            })
        }
    }

    const viewFriendProfile = async (id) => {
        setLoadingProfile(true)
        try {
            const res = await axios.get(`/api/social/profile/${id}`, {
                headers: { 'x-auth-token': token }
            })
            setSelectedFriend(res.data)
        } catch (err) {
            console.error(err)
            addToast({
                message: `Failed to load athlete profile: ${err.message}`,
                type: 'error'
            })
        } finally {
            setLoadingProfile(false)
        }
    }

    const incomingRequests = network.requests.filter(
        r => r.type === 'incoming' && r.status === 'pending'
    )

    return (
        <div style={styles.container} className="social-container">
            {/* Header */}
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <h1>Social & Community</h1>
                    <p style={styles.headerSub}>
                        Inspect peer volume splits, track connections, and adopt routine templates.
                    </p>
                </div>
            </header>

            {/* Bento Grid */}
            <div style={styles.grid} className="bento-grid">
                {/* Search Panel */}
                <div style={{ ...styles.card, gridColumn: 'span 7' }}>
                    <div style={styles.cardHeader}>
                        <div style={styles.iconBox}>
                            <Search size={16} color="#3b82f6" />
                        </div>
                        <div>
                            <h2>Athlete Discovery</h2>
                            <p style={styles.cardSub}>Search by name or email identifier</p>
                        </div>
                    </div>

                    <div style={styles.searchWrapper}>
                        <input
                            type="text"
                            placeholder="Type name or email to search..."
                            value={searchQuery}
                            onChange={handleSearchInput}
                            style={styles.searchInput}
                        />
                    </div>

                    <div style={styles.scrollList}>
                        {searching ? (
                            <p style={styles.emptyText}>Searching registry...</p>
                        ) : searchResults.length === 0 && searchQuery.length >= 2 ? (
                            <p style={styles.emptyText}>No matching athletes found for "{searchQuery}".</p>
                        ) : searchResults.length === 0 ? (
                            <p style={styles.emptyText}>Enter 2 or more characters to query athletes.</p>
                        ) : (
                            searchResults.map(u => {
                                const isFriend = network.friends.some(f => f._id === u._id)
                                return (
                                    <div key={u._id} style={styles.userRow}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={styles.miniAvatar}>
                                                {(u.name?.[0] || 'A').toUpperCase()}
                                            </div>
                                            <div>
                                                <p style={styles.userName}>{u.name}</p>
                                                <p style={styles.userEmail}>{u.email}</p>
                                            </div>
                                        </div>

                                        <div>
                                            {isFriend ? (
                                                <span style={styles.connectedBadge}>
                                                    <UserCheck size={14} /> Connected
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => sendRequest(u._id, u.name)}
                                                    disabled={u.pending}
                                                    className="btn-secondary"
                                                    style={styles.actionBtn}
                                                >
                                                    <UserPlus size={14} />
                                                    <span>{u.pending ? 'Requested' : 'Connect'}</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* Incoming Requests Panel */}
                <div style={{ ...styles.card, gridColumn: 'span 5' }}>
                    <div style={styles.cardHeader}>
                        <div style={styles.iconBox}>
                            <Zap size={16} color="#3b82f6" />
                        </div>
                        <div>
                            <h3>Connection Requests</h3>
                            <p style={styles.cardSub}>
                                {incomingRequests.length} pending review
                            </p>
                        </div>
                    </div>

                    <div style={styles.scrollList}>
                        {incomingRequests.length === 0 ? (
                            <p style={styles.emptyText}>No pending incoming requests.</p>
                        ) : (
                            incomingRequests.map(req => (
                                <div key={req._id} style={styles.userRow}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={styles.miniAvatar}>
                                            {(req.user?.name?.[0] || 'A').toUpperCase()}
                                        </div>
                                        <div>
                                            <p style={styles.userName}>{req.user.name}</p>
                                            <p style={styles.userEmail}>{req.user.email}</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button
                                            onClick={() => respondRequest(req.user._id, 'accepted', req.user.name)}
                                            style={styles.btnAccept}
                                            title="Accept"
                                            aria-label="Accept connection"
                                        >
                                            <Check size={14} color="#10b981" />
                                        </button>
                                        <button
                                            onClick={() => respondRequest(req.user._id, 'rejected', req.user.name)}
                                            style={styles.btnReject}
                                            title="Decline"
                                            aria-label="Decline connection"
                                        >
                                            <X size={14} color="#ef4444" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Active Network Panel */}
                <div style={{ ...styles.card, gridColumn: 'span 12' }}>
                    <div style={styles.cardHeader}>
                        <div style={styles.iconBox}>
                            <Users size={16} color="#3b82f6" />
                        </div>
                        <div>
                            <h2>Active Network ({network.friends.length})</h2>
                            <p style={styles.cardSub}>Connected training partners</p>
                        </div>
                    </div>

                    {network.friends.length === 0 ? (
                        <div style={styles.emptyCard}>
                            <p style={styles.emptyText}>No connections established yet.</p>
                            <p style={{ fontSize: '0.8125rem', color: '#71717a', marginTop: '4px' }}>
                                Use the Athlete Discovery module above to connect with partners.
                            </p>
                        </div>
                    ) : (
                        <div style={styles.friendsGrid}>
                            {network.friends.map(friend => (
                                <div
                                    key={friend._id}
                                    style={styles.friendCard}
                                    onClick={() => viewFriendProfile(friend._id)}
                                >
                                    <div style={styles.friendAvatar}>
                                        {(friend.name?.[0] || 'A').toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={styles.userName}>{friend.name}</p>
                                        <p style={styles.userEmail}>{friend.email || 'Athlete'}</p>
                                    </div>
                                    <ArrowUpRight size={14} color="#71717a" />
                                </div>
                            ))}
                        </div>
                    )}
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
    searchWrapper: {
        marginBottom: '12px'
    },
    searchInput: {
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
    userRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 12px',
        backgroundColor: '#18181b',
        border: '1px solid #27272a',
        borderRadius: '6px'
    },
    miniAvatar: {
        width: '30px',
        height: '30px',
        borderRadius: '4px',
        backgroundColor: '#27272a',
        color: '#f4f4f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontSize: '0.75rem',
        flexShrink: 0
    },
    userName: {
        fontSize: '0.8125rem',
        fontWeight: 500,
        color: '#f4f4f5',
        margin: 0
    },
    userEmail: {
        fontSize: '0.6875rem',
        color: '#71717a',
        margin: 0
    },
    actionBtn: {
        padding: '4px 10px',
        fontSize: '0.75rem',
        gap: '4px'
    },
    connectedBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '0.75rem',
        color: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        padding: '3px 8px',
        borderRadius: '4px'
    },
    btnAccept: {
        width: '28px',
        height: '28px',
        borderRadius: '4px',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
    },
    btnReject: {
        width: '28px',
        height: '28px',
        borderRadius: '4px',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
    },
    friendsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '12px'
    },
    friendCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        backgroundColor: '#18181b',
        border: '1px solid #27272a',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'background-color 100ms ease, border-color 100ms ease'
    },
    friendAvatar: {
        width: '36px',
        height: '36px',
        borderRadius: '6px',
        backgroundColor: '#27272a',
        color: '#f4f4f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontSize: '0.875rem',
        flexShrink: 0
    },
    emptyCard: {
        padding: '32px 16px',
        textAlign: 'center',
        border: '1px dashed #27272a',
        borderRadius: '6px',
        backgroundColor: '#18181b'
    }
}

export default Social
