import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
    Activity,
    CheckCircle2,
    Flame,
    ChevronRight,
    TrendingUp,
    Calendar as CalendarIcon,
    ArrowUpRight,
    Plus,
    Clock
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'

const DURATION_PRESETS = [30, 45, 60, 90]
const INTENSITY_OPTIONS = [
    { label: 'High', desc: 'RPE 8-10' },
    { label: 'Moderate', desc: 'RPE 6-7' },
    { label: 'Light', desc: 'RPE 4-5' },
    { label: 'Recovery', desc: 'RPE 1-3' }
]

export const Dashboard = () => {
    const navigate = useNavigate()
    const { user, token } = useAuthStore()
    const { addToast } = useToastStore()

    const [todaySchedule, setTodaySchedule] = useState(null)
    const [loading, setLoading] = useState(true)
    const [attendance, setAttendance] = useState([])
    const [streak, setStreak] = useState(0)
    const [attended, setAttended] = useState(false)
    const [checkInDetails, setCheckInDetails] = useState({ duration: 60, intensity: 'High' })
    const [submittingCheckIn, setSubmittingCheckIn] = useState(false)

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
                const attData = attRes.data || []
                setAttendance(attData)

                const todayAtt = attData.find(
                    a => new Date(a.date).toDateString() === new Date().toDateString()
                )
                if (todayAtt) setAttended(true)

                // Calculate Streak
                if (attData.length > 0) {
                    const attSet = new Set(attData.map(a => new Date(a.date).toDateString()))
                    let s = 0
                    let curr = new Date()
                    curr.setHours(0, 0, 0, 0)

                    if (!attSet.has(curr.toDateString())) {
                        curr.setDate(curr.getDate() - 1)
                    }

                    let misses = 0
                    let windowArr = []

                    while (true) {
                        const dStr = curr.toDateString()
                        const hasAtt = attSet.has(dStr)
                        windowArr.push(hasAtt)
                        if (windowArr.length > 7) {
                            if (!windowArr.shift()) misses--
                        }
                        if (hasAtt) {
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
                addToast({
                    message: `Telemetry sync failed: ${err.message}`,
                    type: 'error'
                })
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [token, today])

    // Optimistic check-in mutation (<50ms)
    const handleCheckIn = async () => {
        if (submittingCheckIn || attended) return
        setSubmittingCheckIn(true)

        const prevAttended = attended
        const prevStreak = streak
        const prevAttendance = [...attendance]

        const optimisticRecord = {
            date: new Date().toISOString(),
            duration: checkInDetails.duration,
            mood: checkInDetails.intensity
        }

        setAttended(true)
        setStreak(prev => prev + 1)
        setAttendance(prev => [...prev, optimisticRecord])

        addToast({
            message: `Session logged: ${checkInDetails.duration} min (${checkInDetails.intensity} intensity).`,
            type: 'success'
        })

        try {
            const config = { headers: { 'x-auth-token': token } }
            await axios.post(
                '/api/attendance',
                {
                    date: new Date(),
                    duration: checkInDetails.duration,
                    mood: checkInDetails.intensity
                },
                config
            )
        } catch (err) {
            setAttended(prevAttended)
            setStreak(prevStreak)
            setAttendance(prevAttendance)

            addToast({
                message: `Failed to record attendance: ${err.message}`,
                type: 'error',
                action: {
                    label: 'Retry',
                    onClick: () => handleCheckIn()
                }
            })
        } finally {
            setSubmittingCheckIn(false)
        }
    }

    const chartData = attendance.slice(-7).map(a => ({
        day: new Date(a.date).toLocaleDateString('en-US', { weekday: 'short' }),
        duration: Number(a.duration) || 0
    }))

    const greeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Morning'
        if (hour < 18) return 'Afternoon'
        return 'Evening'
    }

    return (
        <div style={styles.container} className="dashboard-container">
            {/* Header */}
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <p style={styles.headerCaption}>
                        {greeting()} • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    <h1>{user?.name ? user.name.split(' ')[0] : 'Athlete'}</h1>
                </div>

                <button
                    onClick={() => navigate(`/schedule?day=${today}`)}
                    className="btn-secondary"
                    style={styles.headerBtn}
                >
                    <span>{today} Split</span>
                    <ArrowUpRight size={14} />
                </button>
            </header>

            {/* Quick Metrics Bar on Mobile (Streak + Weekly Progress side-by-side) */}
            <div style={styles.mobileMetricsRow} className="mobile-metrics-strip">
                <div style={styles.miniMetricCard}>
                    <div style={styles.miniMetricIconFlame}>
                        <Flame size={16} color="#f59e0b" />
                    </div>
                    <div>
                        <span style={styles.miniMetricLabel}>Streak</span>
                        <span style={styles.miniMetricValue} className="tabular-nums">
                            {streak} <small style={{ fontSize: '0.6875rem', color: '#71717a' }}>days</small>
                        </span>
                    </div>
                </div>

                <div style={styles.miniMetricCard}>
                    <div style={styles.miniMetricIconCheck}>
                        <CalendarIcon size={16} color="#10b981" />
                    </div>
                    <div>
                        <span style={styles.miniMetricLabel}>Target</span>
                        <span style={styles.miniMetricValue} className="tabular-nums">
                            {Math.min(attendance.length, 5)}/5 <small style={{ fontSize: '0.6875rem', color: '#71717a' }}>done</small>
                        </span>
                    </div>
                </div>
            </div>

            {/* Bento Grid (Stacks cleanly on mobile) */}
            <div style={styles.grid} className="bento-grid">
                {/* 1. Today's Program Card */}
                <div style={{ ...styles.card, gridColumn: 'span 8' }}>
                    <div style={styles.cardHeader}>
                        <div style={styles.iconBox}>
                            <Activity size={16} color="#3b82f6" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h2>Today: {today}</h2>
                            <p style={styles.cardSub}>
                                {todaySchedule?.exercises?.length || 0} programmed movements
                            </p>
                        </div>
                        <button
                            onClick={() => navigate(`/schedule?day=${today}`)}
                            style={styles.cardHeaderAction}
                        >
                            Edit
                        </button>
                    </div>

                    {loading ? (
                        <div style={styles.loadingBox}>Loading session parameters...</div>
                    ) : todaySchedule && todaySchedule.exercises.length > 0 ? (
                        <div style={styles.exerciseGrid}>
                            {todaySchedule.exercises.map((ex, i) => (
                                <div key={i} style={styles.exerciseCard}>
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <p style={styles.exName}>{ex.name || 'Movement'}</p>
                                        <p style={styles.exMeta} className="tabular-nums">
                                            {ex.sets} sets × {ex.reps} reps
                                        </p>
                                    </div>
                                    <div style={styles.rowChevron}>
                                        <ChevronRight size={16} color="#71717a" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={styles.emptyCard}>
                            <p style={styles.emptyTitle}>Rest day or no workout programmed</p>
                            <p style={styles.emptyText}>
                                Tap below to program your movements for {today}.
                            </p>
                            <button
                                onClick={() => navigate(`/schedule?day=${today}`)}
                                className="btn-primary"
                                style={{ marginTop: '12px', width: '100%' }}
                            >
                                <Plus size={14} /> Program {today}
                            </button>
                        </div>
                    )}
                </div>

                {/* 2. Daily Check-in Card (Mobile-Optimized Pills) */}
                <div style={{ ...styles.card, gridColumn: 'span 4' }}>
                    <div style={styles.cardHeader}>
                        <div style={styles.iconBox}>
                            <CheckCircle2 size={16} color={attended ? '#10b981' : '#71717a'} />
                        </div>
                        <div>
                            <h3>Session Verification</h3>
                            <p style={styles.cardSub}>Log completed workout</p>
                        </div>
                    </div>

                    {attended ? (
                        <div style={styles.attendedState}>
                            <div style={styles.verifiedBadge}>
                                <CheckCircle2 size={14} color="#10b981" />
                                <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.8125rem' }}>
                                    Session Logged Today
                                </span>
                            </div>
                            <p style={{ fontSize: '0.8125rem', color: '#71717a', marginTop: '8px' }}>
                                Telemetry logged. Consistency score updated.
                            </p>
                        </div>
                    ) : (
                        <div style={styles.checkinForm}>
                            {/* Duration Presets for mobile touch */}
                            <div style={styles.formGroup}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label style={styles.label}>Duration</label>
                                    <span style={styles.durationDisplay} className="tabular-nums">
                                        <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                        {checkInDetails.duration} min
                                    </span>
                                </div>
                                <div style={styles.durationPresetRow}>
                                    {DURATION_PRESETS.map((dur) => (
                                        <button
                                            key={dur}
                                            type="button"
                                            onClick={() => setCheckInDetails({ ...checkInDetails, duration: dur })}
                                            style={{
                                                ...styles.presetBtn,
                                                backgroundColor: checkInDetails.duration === dur ? '#3b82f6' : '#18181b',
                                                color: checkInDetails.duration === dur ? '#ffffff' : '#a1a1aa',
                                                borderColor: checkInDetails.duration === dur ? '#3b82f6' : '#27272a'
                                            }}
                                        >
                                            {dur}m
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Intensity Pills */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Intensity (RPE)</label>
                                <div style={styles.intensityPillGrid}>
                                    {INTENSITY_OPTIONS.map((opt) => {
                                        const isSelected = checkInDetails.intensity === opt.label
                                        return (
                                            <button
                                                key={opt.label}
                                                type="button"
                                                onClick={() => setCheckInDetails({ ...checkInDetails, intensity: opt.label })}
                                                style={{
                                                    ...styles.intensityPill,
                                                    backgroundColor: isSelected ? '#27272a' : '#18181b',
                                                    borderColor: isSelected ? '#3b82f6' : '#27272a',
                                                    color: isSelected ? '#ffffff' : '#a1a1aa'
                                                }}
                                            >
                                                <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{opt.label}</span>
                                                <span style={{ fontSize: '0.6875rem', color: '#71717a' }}>{opt.desc}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <button
                                onClick={handleCheckIn}
                                disabled={submittingCheckIn}
                                className="btn-primary"
                                style={styles.logSubmitBtn}
                            >
                                {submittingCheckIn ? 'Logging...' : 'Log Workout Session'}
                            </button>
                        </div>
                    )}
                </div>

                {/* 3. Training Volume Chart */}
                <div style={{ ...styles.card, gridColumn: 'span 12' }}>
                    <div style={styles.cardHeader}>
                        <div style={styles.iconBox}>
                            <TrendingUp size={16} color="#3b82f6" />
                        </div>
                        <div>
                            <h2>Recent Activity History</h2>
                            <p style={styles.cardSub}>Minutes logged across last 7 sessions</p>
                        </div>
                    </div>

                    <div style={{ height: '180px', width: '100%', marginTop: '8px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="durationGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="day"
                                    stroke="#71717a"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#18181b',
                                        border: '1px solid #27272a',
                                        borderRadius: '6px',
                                        fontSize: '0.8125rem'
                                    }}
                                    itemStyle={{ color: '#f4f4f5' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="duration"
                                    stroke="#3b82f6"
                                    fillOpacity={1}
                                    fill="url(#durationGrad)"
                                    strokeWidth={2}
                                    animationDuration={300}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}

const styles = {
    container: {
        padding: '16px',
        maxWidth: '1200px',
        margin: '0 auto',
        minHeight: '100%',
        boxSizing: 'border-box'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        borderBottom: '1px solid #27272a',
        paddingBottom: '12px'
    },
    headerLeft: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px'
    },
    headerCaption: {
        fontSize: '0.6875rem',
        color: '#71717a',
        textTransform: 'uppercase',
        letterSpacing: '0.04em'
    },
    headerBtn: {
        fontSize: '0.8125rem',
        padding: '6px 12px',
        minHeight: '36px'
    },
    mobileMetricsRow: {
        display: 'flex',
        gap: '8px',
        marginBottom: '14px',
        width: '100%'
    },
    miniMetricCard: {
        flex: 1,
        backgroundColor: '#121215',
        border: '1px solid #27272a',
        borderRadius: '8px',
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    miniMetricIconFlame: {
        width: '32px',
        height: '32px',
        borderRadius: '6px',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    },
    miniMetricIconCheck: {
        width: '32px',
        height: '32px',
        borderRadius: '6px',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    },
    miniMetricLabel: {
        display: 'block',
        fontSize: '0.6875rem',
        color: '#71717a',
        textTransform: 'uppercase',
        letterSpacing: '0.04em'
    },
    miniMetricValue: {
        fontSize: '1.125rem',
        fontWeight: 600,
        color: '#f4f4f5'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: '14px'
    },
    card: {
        backgroundColor: '#121215',
        border: '1px solid #27272a',
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '14px'
    },
    iconBox: {
        width: '30px',
        height: '30px',
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
    cardHeaderAction: {
        background: 'transparent',
        border: 'none',
        color: '#3b82f6',
        fontSize: '0.8125rem',
        fontWeight: 500,
        cursor: 'pointer',
        padding: '4px 8px'
    },
    loadingBox: {
        padding: '24px',
        textAlign: 'center',
        color: '#71717a',
        fontSize: '0.8125rem'
    },
    exerciseGrid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
    },
    exerciseCard: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px',
        backgroundColor: '#18181b',
        border: '1px solid #27272a',
        borderRadius: '6px'
    },
    exName: {
        fontSize: '0.8125rem',
        fontWeight: 500,
        color: '#f4f4f5',
        margin: 0
    },
    exMeta: {
        fontSize: '0.75rem',
        color: '#71717a',
        margin: 0
    },
    rowChevron: {
        display: 'flex',
        alignItems: 'center',
        marginLeft: '8px'
    },
    emptyCard: {
        padding: '24px 12px',
        textAlign: 'center',
        border: '1px dashed #27272a',
        borderRadius: '6px',
        backgroundColor: '#18181b'
    },
    emptyTitle: {
        fontSize: '0.875rem',
        fontWeight: 500,
        color: '#f4f4f5',
        marginBottom: '4px'
    },
    emptyText: {
        fontSize: '0.8125rem',
        color: '#71717a'
    },
    attendedState: {
        padding: '14px',
        backgroundColor: '#18181b',
        border: '1px solid #27272a',
        borderRadius: '6px'
    },
    verifiedBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        padding: '4px 8px',
        borderRadius: '4px'
    },
    checkinForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
    },
    label: {
        fontSize: '0.75rem',
        color: '#71717a',
        fontWeight: 500
    },
    durationDisplay: {
        fontSize: '0.75rem',
        color: '#3b82f6',
        fontWeight: 600
    },
    durationPresetRow: {
        display: 'flex',
        gap: '6px'
    },
    presetBtn: {
        flex: 1,
        height: '36px',
        borderRadius: '6px',
        border: '1px solid #27272a',
        fontSize: '0.8125rem',
        fontWeight: 600,
        cursor: 'pointer',
        touchAction: 'manipulation'
    },
    intensityPillGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '6px'
    },
    intensityPill: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 6px',
        borderRadius: '6px',
        border: '1px solid #27272a',
        cursor: 'pointer',
        touchAction: 'manipulation'
    },
    logSubmitBtn: {
        width: '100%',
        minHeight: '44px',
        fontSize: '0.875rem',
        fontWeight: 600,
        marginTop: '4px'
    }
}

export default Dashboard
