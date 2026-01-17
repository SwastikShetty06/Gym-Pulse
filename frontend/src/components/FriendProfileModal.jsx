import { useState } from 'react'
import axios from 'axios'
import { X, Flame, BarChart2, Zap, Copy, ChevronDown, ChevronUp, Lock } from 'lucide-react'
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuthStore } from '../store/authStore'

const FriendProfileModal = ({ friend, onClose }) => {
    const { token } = useAuthStore()
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
        if (!friend.schedule || friend.schedule.length === 0) return;
        if (!window.confirm(`Are you sure you want to copy ${friend.user.name}'s entire weekly schedule to yours? This will update your existing days.`)) return;

        try {
            await axios.post('/api/schedule/bulk', {
                schedules: friend.schedule
            }, { headers: { 'x-auth-token': token } })
            alert(`Successfully copied ${friend.user.name}'s weekly routine!`)
        } catch (err) {
            console.error(err)
            alert('Failed to copy schedule')
        }
    }

    if (!friend) return null

    return (
        <div className="social-modal-overlay" style={styles.modalOverlay} onClick={onClose}>
            <div className="glass radial-glow social-modal-content" style={{ ...styles.modalContent, overflowY: 'auto', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
                <button style={styles.closeBtn} onClick={onClose}><X size={24} /></button>

                <div style={styles.modalHeader}>
                    <div style={styles.largeAvatar}>{friend.user.name ? friend.user.name[0] : '?'}</div>
                    <div>
                        <h2 style={{ fontSize: '2rem' }}>{friend.user.name}</h2>
                        <p style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Elite Performance Profile</p>
                    </div>
                </div>

                <div style={styles.modalStats} className="modal-stats-mobile">
                    {friend.isPrivate ? (
                        <div style={{ width: '100%', textAlign: 'center', padding: '1rem' }}>
                            <div style={{
                                width: '60px', height: '60px', borderRadius: '50%',
                                background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 1rem'
                            }}>
                                <Lock size={30} color="var(--text-secondary)" />
                            </div>
                            <h3 style={{ marginBottom: '0.5rem' }}>Private Account</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                Follow this user to see their stats and schedule.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div style={styles.miniStat} className="mini-stat-mobile">
                                <Flame size={24} color="#f97316" />
                                <div>
                                    <p style={styles.statLabel}>Streak</p>
                                    <p style={styles.statValue}>{friend.streak || 0} Days</p>
                                </div>
                            </div>
                            <div style={styles.miniStat} className="mini-stat-mobile">
                                <BarChart2 size={24} color="var(--success)" />
                                <div>
                                    <p style={styles.statLabel}>Total PRs</p>
                                    <p style={styles.statValue}>{friend.prs.length}</p>
                                </div>
                            </div>
                            <div style={styles.miniStat} className="mini-stat-mobile">
                                <Zap size={24} color="var(--accent-secondary)" />
                                <div>
                                    <p style={styles.statLabel}>Consistency</p>
                                    <p style={styles.statValue}>
                                        {friend.consistency || 0}%
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Weekly Schedule Detailed */}
                {!friend.isPrivate && (
                    <>
                        {/* Weekly Schedule Detailed */}
                        <div style={{ marginTop: '2.5rem' }}>
                            {/* ... schedule content ... */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Weekly Training Split</p>
                                {friend.schedule && friend.schedule.length > 0 && (
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

                            {friend.schedule && friend.schedule.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                                        const daySched = friend.schedule.find(s => s.day === day);
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
                                <AreaChart data={friend.attendance.slice(0, 14).reverse().map(a => ({
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
                                {friend.prs.map(pr => (
                                    <div key={pr._id} style={{ ...styles.modalPrRow, border: '1px solid var(--glass-border)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                                        <div>
                                            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{pr.exercise}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(pr.date).toLocaleDateString()}</p>
                                        </div>
                                        <p style={{ fontWeight: 800, color: 'var(--accent-primary)', fontSize: '1.25rem' }}>{pr.weight}<span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '2px' }}>kg</span></p>
                                    </div>
                                ))}
                                {friend.prs.length === 0 && <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', gridColumn: 'span 2' }}>No records yet.</p>}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

const styles = {
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
    statLabel: { fontSize: '0.75rem', color: 'var(--text-secondary)' },
    statValue: { fontSize: '1.25rem', fontWeight: 800 },
    prScroller: { marginTop: '2.5rem' },
    modalPrRow: {
        display: 'flex', justifyContent: 'space-between', padding: '1rem',
        borderBottom: '1px solid var(--glass-border)'
    }
}

export default FriendProfileModal
