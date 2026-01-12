import { useState, useEffect } from 'react'
import axios from 'axios'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { CheckCircle, Award, BarChart2, TrendingUp, Calendar as CalendarIcon } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuthStore } from '../store/authStore'

const Attendance = () => {
    const { token } = useAuthStore()
    const [attendance, setAttendance] = useState([])
    const [loading, setLoading] = useState(true)
    const [date, setDate] = useState(new Date())

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const res = await axios.get('/api/attendance', { headers: { 'x-auth-token': token } })
                setAttendance(res.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchAttendance()
    }, [token])

    const attendedDates = attendance.map(a => new Date(a.date).toDateString())

    const calculateStreak = () => {
        if (attendance.length === 0) return 0
        const attendanceSet = new Set(attendedDates)
        let streak = 0
        let curr = new Date()
        curr.setHours(0, 0, 0, 0)
        let misses = 0
        let window = []

        while (true) {
            const dateStr = curr.toDateString()
            const attended = attendanceSet.has(dateStr)
            window.push(attended)
            if (window.length > 7) {
                if (!window.shift()) misses--
            }
            if (attended) {
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

    const attendanceRate = Math.round((attendance.length / 158) * 100)

    const chartData = attendance
        .slice(-14)
        .map(a => ({
            date: new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            duration: a.duration
        }))

    return (
        <div className="attendance-container" style={styles.container}>
            <header style={styles.header}>
                <h1 style={{ fontSize: '3rem' }}>Your <span className="gradient-text">Progress</span></h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Consistency is the path to elite performance. One rest day allowed per week.</p>
            </header>

            <div className="bento-grid" style={styles.grid}>
                {/* Calendar Card - Span 8 */}
                <div className="glass hover-lift" style={{ ...styles.card, gridColumn: 'span 8', gridRow: 'span 2' }}>
                    <div style={styles.cardHeader}>
                        <div style={styles.iconBox}>
                            <CalendarIcon size={20} color="var(--accent-primary)" />
                        </div>
                        <h3 style={{ marginLeft: '1rem' }}>Activity History</h3>
                    </div>
                    <div className="calendar-wrapper">
                        <Calendar
                            onChange={setDate}
                            value={date}
                            tileContent={tileContent}
                            className="custom-calendar"
                        />
                    </div>
                </div>

                {/* Streak Highlights - Span 4 */}
                <div className="glass hover-lift radial-glow" style={{ ...styles.card, gridColumn: 'span 4' }}>
                    <Award size={40} color="var(--accent-secondary)" style={{ marginBottom: '1rem' }} />
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Workout Streak</p>
                    <p style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1, margin: '0.5rem 0' }}>{streak}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Days of elite consistency</p>
                </div>

                {/* Adherence Circle - Span 4 */}
                <div className="glass hover-lift" style={{ ...styles.card, gridColumn: 'span 4' }}>
                    <div style={styles.cardHeader}>
                        <div style={styles.iconBox}>
                            <CheckCircle size={20} color="var(--success)" />
                        </div>
                        <h3 style={{ marginLeft: '1rem' }}>Adherence</h3>
                    </div>
                    <p style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>{attendanceRate}%</p>
                    <div style={styles.progressBar}>
                        <div className="shimmer" style={{ ...styles.progressFill, width: `${attendanceRate}%` }} />
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>Based on your personal roadmap goals</p>
                </div>

                {/* Intensity Chart - Span 12 */}
                <div className="glass hover-lift" style={{ ...styles.card, gridColumn: 'span 12' }}>
                    <div style={styles.cardHeader}>
                        <div style={styles.iconBox}>
                            <TrendingUp size={20} color="var(--accent-primary)" />
                        </div>
                        <h3 style={{ marginLeft: '1rem' }}>Volume & Intensity (Last 14 Sessions)</h3>
                    </div>
                    <div style={{ height: '300px', width: '100%', marginTop: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorDurProgress" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                                    itemStyle={{ color: 'white' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="duration"
                                    stroke="var(--accent-primary)"
                                    fillOpacity={1}
                                    fill="url(#colorDurProgress)"
                                    strokeWidth={4}
                                    animationDuration={2000}
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
          color: white !important;
          font-family: var(--font-header) !important;
        }
        .react-calendar__tile {
          color: white !important;
          padding: 1.5rem 0.5rem !important;
          border-radius: 14px;
          transition: all 0.2s ease;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .dot-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--success);
          box-shadow: 0 0 10px var(--success);
        }
        .react-calendar__tile:hover {
          background: rgba(255,255,255,0.05) !important;
        }
        .react-calendar__tile--active {
          background: var(--accent-primary) !important;
          color: white !important;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
        }
        .react-calendar__navigation button {
          color: white !important;
          min-width: 44px;
          background: none;
          font-size: 1.2rem;
          border-radius: 12px;
        }
        .react-calendar__navigation button:hover {
          background: rgba(255,255,255,0.05) !important;
        }
        .react-calendar__month-view__weekdays__weekday {
          color: var(--text-secondary) !important;
          text-decoration: none !important;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.75rem;
          padding-bottom: 1rem;
        }
        .react-calendar__month-view__days__day--neighboringMonth {
          opacity: 0.2;
        }
      `}</style>
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
        flexDirection: 'column'
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '2rem'
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
            .attendance-container .bento-grid { grid-template-columns: repeat(2, 1fr) !important; }
            .attendance-container .bento-grid > div { grid-column: span 2 !important; }
        }
        @media (max-width: 640px) {
            .attendance-container { padding: 1.5rem 1rem !important; padding-bottom: 90px !important; }
            .attendance-container .bento-grid { grid-template-columns: 1fr !important; }
            .attendance-container .bento-grid > div { grid-column: span 1 !important; }
            .attendance-container .react-calendar__tile { padding: 1rem 0.2rem !important; }
        }
    `
    document.head.appendChild(style)
}

export default Attendance
