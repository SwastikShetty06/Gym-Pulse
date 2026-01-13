import { useState, useEffect } from 'react'
import axios from 'axios'
import { Dumbbell, CheckCircle, Flame, ChevronRight, BarChart2, TrendingUp, Calendar as CalendarIcon } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuthStore } from '../store/authStore'

const Dashboard = () => {
    const { user, token } = useAuthStore()
    const [todaySchedule, setTodaySchedule] = useState(null)
    const [loading, setLoading] = useState(true)
    const [attendance, setAttendance] = useState([])
    const [streak, setStreak] = useState(0)
    const [attended, setAttended] = useState(false)

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const today = days[new Date().getDay()]

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { 'x-auth-token': token } }
                const res = await axios.get('/api/schedule', config)
                const currentDay = res.data.find(s => s.day === today)
                setTodaySchedule(currentDay)

                const attRes = await axios.get('/api/attendance', config)
                const attData = attRes.data
                setAttendance(attData)

                const todayAtt = attData.find(a => new Date(a.date).toDateString() === new Date().toDateString())
                if (todayAtt) setAttended(true)

                // Calculate Streak
                if (attData.length > 0) {
                    const attSet = new Set(attData.map(a => new Date(a.date).toDateString()))
                    let s = 0
                    let curr = new Date()
                    curr.setHours(0, 0, 0, 0)
                    
                    // Fix: If today is not attended, start checking from yesterday
                    // This prevents "Today" from counting as a miss immediately
                    if (!attSet.has(curr.toDateString())) {
                        curr.setDate(curr.getDate() - 1)
                    }

                    let misses = 0
                    let window = []

                    while (true) {
                        const dStr = curr.toDateString()
                        const attended = attSet.has(dStr)
                        window.push(attended)
                        if (window.length > 7) {
                            if (!window.shift()) misses--
                        }
                        if (attended) {
                            s++
                        } else {
                            misses++
                        }
                        if (misses > 1) break
                        curr.setDate(curr.getDate() - 1)
                        if (s > 500) break
                    }
                    setStreak(s)
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [token, today])

    const [checkInDetails, setCheckInDetails] = useState({ duration: 60, mood: 'Good' })

    const handleCheckIn = async () => {
        try {
            const config = { headers: { 'x-auth-token': token } }
            await axios.post('/api/attendance', {
                date: new Date(),
                duration: checkInDetails.duration,
                mood: checkInDetails.mood
            }, config)
            setAttended(true)
            setStreak(prev => prev + 1)
        } catch (err) {
            console.error(err)
        }
    }

    const chartData = attendance
        .slice(-7)
        .map(a => ({
            day: new Date(a.date).toLocaleDateString('en-US', { weekday: 'short' }),
            duration: Number(a.duration)
        }))

    const greeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return "Good morning"
        if (hour < 18) return "Good afternoon"
        return "Good evening"
    }

    return (
        <div className="dashboard-container" style={styles.container}>
            <header style={styles.header}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{greeting()},</p>
                <h1 style={{ fontSize: '3rem', lineHeight: 1 }}>
                    <span className="gradient-text">{user?.name.split(' ')[0]}</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    {streak > 5 ? `You're on a ${streak}-day roll! Keep it up.` : "Let's crush today's goals!"}
                </p>
            </header>

            <div className="bento-grid" style={styles.grid}>
                {/* Main Workout Card - Span 8 */}
                <div className="glass hover-lift radial-glow" style={{ ...styles.card, gridColumn: 'span 8', gridRow: 'span 2' }}>
                    <div style={styles.cardHeader}>
                        <div style={styles.iconBox}>
                            <Dumbbell size={20} color="var(--accent-primary)" />
                        </div>
                        <h2 style={{ marginLeft: '1rem' }}>Today's Grind: {today}</h2>
                    </div>

                    {loading ? (
                        <div className="shimmer" style={{ height: '200px', borderRadius: '12px' }} />
                    ) : todaySchedule ? (
                        <div style={styles.exerciseGrid}>
                            {todaySchedule.exercises.map((ex, i) => (
                                <div key={i} style={styles.exerciseCard}>
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{ex.name}</p>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{ex.sets} sets • {ex.reps} reps</p>
                                    </div>
                                    <div style={styles.chevronBox}>
                                        <ChevronRight size={18} color="var(--text-secondary)" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>No workout planned for today. Rest is part of the game!</p>
                            <button className="btn-primary">Set Schedule</button>
                        </div>
                    )}
                </div>

                {/* Daily Status / Check-in - Span 4 */}
                <div className="glass hover-lift" style={{ ...styles.card, gridColumn: 'span 4' }}>
                    <div style={styles.cardHeader}>
                        <div style={styles.iconBox}>
                            <CheckCircle size={20} color={attended ? 'var(--success)' : 'var(--text-secondary)'} />
                        </div>
                        <h3 style={{ marginLeft: '1rem' }}>Daily Status</h3>
                    </div>

                    <div style={styles.statusContent}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            {attended ? "Great job! You've checked in today." : 'Have you hit the gym today?'}
                        </p>

                        {!attended && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Duration (min)</label>
                                    <input
                                        type="number"
                                        value={checkInDetails.duration}
                                        onChange={(e) => setCheckInDetails({ ...checkInDetails, duration: e.target.value })}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Energy Level</label>
                                    <select
                                        value={checkInDetails.mood}
                                        onChange={(e) => setCheckInDetails({ ...checkInDetails, mood: e.target.value })}
                                        style={styles.input}
                                    >
                                        <option value="Killer">Killer 🔥</option>
                                        <option value="Good">Good 👍</option>
                                        <option value="Meh">Meh 😐</option>
                                        <option value="Tired">Tired 😴</option>
                                    </select>
                                </div>
                                <button onClick={handleCheckIn} className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                                    Check In Now
                                </button>
                            </div>
                        )}
                        {attended && (
                            <div style={styles.attendedBadge}>
                                <CheckCircle size={48} color="var(--success)" style={{ opacity: 0.2, position: 'absolute', right: -10, bottom: -10 }} />
                                <p style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--success)' }}>Verified</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Session logged successfully</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Streak Card - Span 4 */}
                <div className="glass hover-lift" style={{ ...styles.card, gridColumn: 'span 4', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ ...styles.iconBox, width: '60px', height: '60px', background: 'rgba(249, 115, 22, 0.1)' }}>
                        <Flame size={30} color="#f97316" />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Current Streak</p>
                        <p style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{streak} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Days</span></p>
                    </div>
                </div>

                {/* Intensity Graph - Span 8 */}
                <div className="glass hover-lift" style={{ ...styles.card, gridColumn: 'span 8', gridRow: 'span 2' }}>
                    <div style={styles.cardHeader}>
                        <div style={styles.iconBox}>
                            <TrendingUp size={20} color="var(--accent-secondary)" />
                        </div>
                        <h3 style={{ marginLeft: '1rem' }}>Workout Intensity</h3>
                    </div>
                    <div style={{ height: '220px', width: '100%', marginTop: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorInt" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent-secondary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--accent-secondary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                                    itemStyle={{ color: 'white' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="duration"
                                    stroke="var(--accent-secondary)"
                                    fillOpacity={1}
                                    fill="url(#colorInt)"
                                    strokeWidth={3}
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Weekly Target - Span 4 */}
                <div className="glass hover-lift" style={{ ...styles.card, gridColumn: 'span 4' }}>
                    <div style={styles.cardHeader}>
                        <div style={styles.iconBox}>
                            <CalendarIcon size={20} color="var(--accent-primary)" />
                        </div>
                        <h3 style={{ marginLeft: '1rem' }}>Weekly Target</h3>
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <p style={{ fontWeight: 600 }}>6 / 7 Sessions</p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>85%</p>
                        </div>
                        <div style={styles.progressBar}>
                            <div className="shimmer" style={{ ...styles.progressFill, width: '85%' }} />
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
                            You're ahead of 92% of users! Just one more to hit your goal.
                        </p>
                    </div>
                </div>
            </div>
        </div>
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
        gridAutoRows: 'minmax(120px, auto)',
        gap: '1.5rem'
    },
    card: {
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '1rem'
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
    exerciseGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '1rem'
    },
    exerciseCard: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.25rem',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '16px',
        border: '1px solid var(--glass-border)',
        transition: 'all 0.2s ease'
    },
    chevronBox: {
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.03)'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    label: {
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        fontWeight: 500
    },
    input: {
        width: '100%',
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--glass-border)',
        borderRadius: '12px',
        color: 'white',
        padding: '0.75rem',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'border-color 0.2s ease'
    },
    attendedBadge: {
        padding: '1.5rem',
        background: 'rgba(16, 185, 129, 0.05)',
        borderRadius: '16px',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        position: 'relative',
        overflow: 'hidden'
    },
    progressBar: {
        width: '100%',
        height: '10px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '10px',
        overflow: 'hidden'
    },
    progressFill: {
        height: '100%',
        background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
        borderRadius: '10px'
    }
}

// Inject mobile styles
if (typeof window !== 'undefined') {
    const style = document.createElement('style')
    style.innerHTML = `
        @media (max-width: 1024px) {
            .dashboard-container .bento-grid { grid-template-columns: repeat(2, 1fr) !important; }
            .dashboard-container .bento-grid > div { grid-column: span 2 !important; }
        }
        @media (max-width: 640px) {
            .dashboard-container { padding: 1.5rem 1rem !important; padding-bottom: 90px !important; }
            .dashboard-header h1 { font-size: 2.2rem !important; }
            .dashboard-container .bento-grid { grid-template-columns: 1fr !important; }
            .dashboard-container .bento-grid > div { grid-column: span 1 !important; }
            .dashboard-container .exercise-grid { grid-template-columns: 1fr !important; }
        }
    `
    document.head.appendChild(style)
}

export default Dashboard
