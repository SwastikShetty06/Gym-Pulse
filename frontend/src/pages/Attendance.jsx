import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { CheckCircle2, Flame, TrendingUp, Calendar as CalendarIcon, Activity } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'

export const Attendance = () => {
    const { token } = useAuthStore()
    const { addToast } = useToastStore()
    const [attendance, setAttendance] = useState([])
    const [loading, setLoading] = useState(true)
    const [date, setDate] = useState(new Date())

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const res = await axios.get('/api/attendance', {
                    headers: { 'x-auth-token': token }
                })
                setAttendance(res.data || [])
            } catch (err) {
                console.error(err)
                addToast({
                    message: `Failed to sync attendance history: ${err.message}`,
                    type: 'error'
                })
            } finally {
                setLoading(false)
            }
        }
        fetchAttendance()
    }, [token])

    const attendedDates = attendance.map((a) => new Date(a.date).toDateString())

    const calculateStreak = () => {
        if (attendance.length === 0) return 0
        const attendanceSet = new Set(attendedDates)
        let streak = 0
        let curr = new Date()
        curr.setHours(0, 0, 0, 0)

        if (!attendanceSet.has(curr.toDateString())) {
            curr.setDate(curr.getDate() - 1)
        }

        let misses = 0
        let windowArr = []

        while (true) {
            const dateStr = curr.toDateString()
            const hasAtt = attendanceSet.has(dateStr)
            windowArr.push(hasAtt)
            if (windowArr.length > 7) {
                if (!windowArr.shift()) misses--
            }
            if (hasAtt) {
                streak++
            } else {
                misses++
            }
            if (misses > 1) break
            curr.setDate(curr.getDate() - 1)
            if (streak > 500) break
        }
        return streak
    }

    const streak = calculateStreak()

    const tileContent = ({ date, view }) => {
        if (view === 'month' && attendedDates.includes(date.toDateString())) {
            return <div className="dot-indicator" />
        }
        return null
    }

    const adherenceRate = Math.min(100, Math.round((attendance.length / Math.max(attendance.length, 30)) * 100))

    const chartData = attendance.slice(-14).map((a) => ({
        date: new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        duration: Number(a.duration) || 0
    }))

    return (
        <div style={styles.container} className="attendance-container">
            {/* Header */}
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <h1>Progress & Consistency</h1>
                    <p style={styles.headerSub}>
                        Track attendance streaks, facility sessions, and aggregate workload volume.
                    </p>
                </div>
            </header>

            <div style={styles.grid} className="bento-grid">
                {/* Calendar Card */}
                <div style={{ ...styles.card, gridColumn: 'span 8', gridRow: 'span 2' }}>
                    <div style={styles.cardHeader}>
                        <div style={styles.iconBox}>
                            <CalendarIcon size={16} color="#3b82f6" />
                        </div>
                        <div>
                            <h2>Activity Calendar</h2>
                            <p style={styles.cardSub}>Verified session timestamps</p>
                        </div>
                    </div>

                    <div className="calendar-wrapper" style={{ marginTop: '8px' }}>
                        <Calendar
                            onChange={setDate}
                            value={date}
                            tileContent={tileContent}
                            className="custom-calendar"
                        />
                    </div>
                </div>

                {/* Streak Highlight Card */}
                <div style={{ ...styles.card, gridColumn: 'span 4' }}>
                    <div style={styles.cardHeader}>
                        <div style={styles.iconBox}>
                            <Flame size={16} color="#f59e0b" />
                        </div>
                        <div>
                            <h3>Consistency Streak</h3>
                            <p style={styles.cardSub}>Continuous active periods</p>
                        </div>
                    </div>

                    <div style={{ marginTop: '8px' }}>
                        <span style={styles.metricBig} className="tabular-nums">
                            {streak}
                        </span>
                        <p style={styles.metricCaption}>
                            Consecutive days tracked within adherence threshold
                        </p>
                    </div>
                </div>

                {/* Adherence Card */}
                <div style={{ ...styles.card, gridColumn: 'span 4' }}>
                    <div style={styles.cardHeader}>
                        <div style={styles.iconBox}>
                            <CheckCircle2 size={16} color="#10b981" />
                        </div>
                        <div>
                            <h3>Program Adherence</h3>
                            <p style={styles.cardSub}>Monthly goal completion</p>
                        </div>
                    </div>

                    <div style={{ marginTop: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={styles.metricSubBig} className="tabular-nums">
                                {adherenceRate}%
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#71717a' }} className="tabular-nums">
                                {attendance.length} total sessions
                            </span>
                        </div>
                        <div style={styles.progressBar}>
                            <div
                                style={{
                                    height: '100%',
                                    backgroundColor: '#10b981',
                                    width: `${adherenceRate}%`,
                                    transition: 'width 150ms ease-out'
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Volume & Intensity Chart */}
                <div style={{ ...styles.card, gridColumn: 'span 12' }}>
                    <div style={styles.cardHeader}>
                        <div style={styles.iconBox}>
                            <TrendingUp size={16} color="#3b82f6" />
                        </div>
                        <div>
                            <h2>Volume & Duration (Last 14 Sessions)</h2>
                            <p style={styles.cardSub}>Recorded minutes per workout session</p>
                        </div>
                    </div>

                    <div style={{ height: '220px', width: '100%', marginTop: '12px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorDurProgress" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="date"
                                    stroke="#71717a"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#71717a"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    className="tabular-nums"
                                />
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
                                    fill="url(#colorDurProgress)"
                                    strokeWidth={2}
                                    animationDuration={300}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-calendar {
                    background: transparent !important;
                    border: none !important;
                    width: 100% !important;
                    color: #f4f4f5 !important;
                }
                .react-calendar__tile {
                    color: #f4f4f5 !important;
                    padding: 12px 6px !important;
                    border-radius: 6px;
                    transition: background-color 100ms ease;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.8125rem;
                }
                .dot-indicator {
                    width: 5px;
                    height: 5px;
                    border-radius: 50%;
                    background-color: #10b981;
                }
                .react-calendar__tile:hover {
                    background-color: #1c1c21 !important;
                }
                .react-calendar__tile--active {
                    background-color: #27272a !important;
                    color: #3b82f6 !important;
                    font-weight: 600;
                }
                .react-calendar__navigation button {
                    color: #f4f4f5 !important;
                    min-width: 36px;
                    background: none;
                    font-size: 1rem;
                    border-radius: 6px;
                }
                .react-calendar__navigation button:hover {
                    background-color: #18181b !important;
                }
                .react-calendar__month-view__weekdays__weekday {
                    color: #71717a !important;
                    text-decoration: none !important;
                    font-weight: 500;
                    text-transform: uppercase;
                    font-size: 0.6875rem;
                    padding-bottom: 8px;
                }
                .react-calendar__month-view__days__day--neighboringMonth {
                    opacity: 0.25;
                }
            `}</style>
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
    metricBig: {
        fontSize: '2rem',
        fontWeight: 600,
        color: '#f4f4f5',
        lineHeight: 1
    },
    metricSubBig: {
        fontSize: '1.5rem',
        fontWeight: 600,
        color: '#f4f4f5'
    },
    metricCaption: {
        fontSize: '0.75rem',
        color: '#71717a',
        marginTop: '6px'
    },
    progressBar: {
        width: '100%',
        height: '6px',
        backgroundColor: '#27272a',
        borderRadius: '3px',
        overflow: 'hidden'
    }
}

export default Attendance
