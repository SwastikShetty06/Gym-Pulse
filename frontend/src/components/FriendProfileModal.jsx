import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
    X,
    Flame,
    BarChart2,
    Activity,
    Copy,
    ChevronDown,
    ChevronUp,
    Lock
} from 'lucide-react'
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'

export const FriendProfileModal = ({ friend, onClose }) => {
    const { token } = useAuthStore()
    const { addToast } = useToastStore()
    const [expandedDay, setExpandedDay] = useState(null)
    const [confirmingBulkCopy, setConfirmingBulkCopy] = useState(false)

    // Universal Esc listener to dismiss modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault()
                onClose()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    if (!friend) return null

    const copySchedule = async (daySchedule) => {
        try {
            await axios.post(
                '/api/schedule',
                {
                    day: daySchedule.day,
                    exercises: daySchedule.exercises
                },
                { headers: { 'x-auth-token': token } }
            )
            addToast({
                message: `Adopted ${daySchedule.day} routine (${daySchedule.exercises.length} movements)`,
                type: 'success'
            })
        } catch (err) {
            console.error(err)
            addToast({
                message: `Failed to adopt routine: ${err.message}`,
                type: 'error'
            })
        }
    }

    const copyFullSchedule = async () => {
        if (!friend.schedule || friend.schedule.length === 0) return

        try {
            await axios.post(
                '/api/schedule/bulk',
                { schedules: friend.schedule },
                { headers: { 'x-auth-token': token } }
            )
            setConfirmingBulkCopy(false)
            addToast({
                message: `Adopted complete weekly program from ${friend.user?.name}`,
                type: 'success'
            })
        } catch (err) {
            console.error(err)
            addToast({
                message: `Failed to copy program: ${err.message}`,
                type: 'error'
            })
        }
    }

    const chartData = (friend.attendance || [])
        .slice(0, 14)
        .reverse()
        .map((a) => ({
            date: new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            duration: Number(a.duration) || 0
        }))

    return (
        <div
            style={styles.modalOverlay}
            onClick={onClose}
            className="social-modal-overlay"
        >
            <div
                style={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
                className="social-modal-content"
            >
                {/* Close Button with ESC hint */}
                <div style={styles.topActions}>
                    <kbd style={styles.kbd}>ESC</kbd>
                    <button
                        onClick={onClose}
                        style={styles.closeBtn}
                        aria-label="Close profile modal"
                    >
                        <X size={16} color="#a1a1aa" />
                    </button>
                </div>

                {/* Profile Header */}
                <div style={styles.modalHeader}>
                    <div style={styles.avatar}>
                        {(friend.user?.name?.[0] || 'A').toUpperCase()}
                    </div>
                    <div>
                        <h2 style={styles.name}>{friend.user?.name || 'Athlete'}</h2>
                        <span style={styles.subtitle}>Verified Training Profile</span>
                    </div>
                </div>

                {/* Telemetry Stats Bar */}
                <div style={styles.statsBar}>
                    {friend.isPrivate ? (
                        <div style={styles.privateNotice}>
                            <Lock size={20} color="#71717a" />
                            <p style={{ fontSize: '0.8125rem', color: '#71717a', margin: 0 }}>
                                Private Profile. Connect with this athlete to view detailed metrics and split routines.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div style={styles.statItem}>
                                <Flame size={16} color="#f59e0b" />
                                <div>
                                    <span style={styles.statLabel}>Streak</span>
                                    <span style={styles.statVal} className="tabular-nums">
                                        {friend.streak || 0}d
                                    </span>
                                </div>
                            </div>

                            <div style={styles.statItem}>
                                <BarChart2 size={16} color="#10b981" />
                                <div>
                                    <span style={styles.statLabel}>Total PRs</span>
                                    <span style={styles.statVal} className="tabular-nums">
                                        {friend.prs?.length || 0}
                                    </span>
                                </div>
                            </div>

                            <div style={styles.statItem}>
                                <Activity size={16} color="#3b82f6" />
                                <div>
                                    <span style={styles.statLabel}>Consistency</span>
                                    <span style={styles.statVal} className="tabular-nums">
                                        {friend.consistency || 0}%
                                    </span>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {!friend.isPrivate && (
                    <>
                        {/* Weekly Training Split */}
                        <div style={{ marginTop: '20px' }}>
                            <div style={styles.sectionHeader}>
                                <h3>Programmed Split</h3>
                                {friend.schedule && friend.schedule.length > 0 && (
                                    <div>
                                        {confirmingBulkCopy ? (
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button
                                                    onClick={copyFullSchedule}
                                                    className="btn-primary"
                                                    style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                                >
                                                    Confirm Overwrite
                                                </button>
                                                <button
                                                    onClick={() => setConfirmingBulkCopy(false)}
                                                    className="btn-secondary"
                                                    style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setConfirmingBulkCopy(true)}
                                                className="btn-secondary"
                                                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                            >
                                                <Copy size={12} />
                                                <span>Adopt Entire Week</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {friend.schedule && friend.schedule.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {[
                                        'Monday',
                                        'Tuesday',
                                        'Wednesday',
                                        'Thursday',
                                        'Friday',
                                        'Saturday',
                                        'Sunday'
                                    ].map((day) => {
                                        const daySched = friend.schedule.find((s) => s.day === day)
                                        const isExpanded = expandedDay === day
                                        if (!daySched) return null

                                        return (
                                            <div
                                                key={day}
                                                style={styles.dayRow}
                                                onClick={() => setExpandedDay(isExpanded ? null : day)}
                                            >
                                                <div style={styles.daySummary}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        {isExpanded ? (
                                                            <ChevronUp size={14} color="#3b82f6" />
                                                        ) : (
                                                            <ChevronDown size={14} color="#71717a" />
                                                        )}
                                                        <div>
                                                            <span style={styles.dayLabel}>{day}</span>
                                                            <span style={styles.dayExCount} className="tabular-nums">
                                                                {' • '}{daySched.exercises?.length || 0} movements
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            copySchedule(daySched)
                                                        }}
                                                        className="btn-secondary"
                                                        style={{ padding: '3px 8px', fontSize: '0.6875rem' }}
                                                    >
                                                        Adopt Day
                                                    </button>
                                                </div>

                                                {isExpanded && (
                                                    <div style={styles.expandedExercises}>
                                                        {daySched.exercises?.map((ex, i) => (
                                                            <div key={i} style={styles.exSubRow}>
                                                                <span style={{ color: '#f4f4f5' }}>{ex.name}</span>
                                                                <span style={{ color: '#71717a' }} className="tabular-nums">
                                                                    {ex.sets} × {ex.reps}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <p style={styles.emptyText}>No routine programmed.</p>
                            )}
                        </div>

                        {/* Volume Graph */}
                        <div style={{ marginTop: '20px' }}>
                            <div style={styles.sectionHeader}>
                                <h3>Training History (Minutes)</h3>
                            </div>
                            <div style={{ height: '140px', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <XAxis dataKey="date" stroke="#71717a" fontSize={11} hide />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#18181b',
                                                border: '1px solid #27272a',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem'
                                            }}
                                            itemStyle={{ color: '#f4f4f5' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="duration"
                                            stroke="#3b82f6"
                                            fill="#3b82f6"
                                            fillOpacity={0.15}
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Personal Records Vault */}
                        <div style={{ marginTop: '20px' }}>
                            <div style={styles.sectionHeader}>
                                <h3>Personal Records Vault</h3>
                            </div>
                            <div style={styles.prGrid}>
                                {friend.prs && friend.prs.length > 0 ? (
                                    friend.prs.map((pr) => (
                                        <div key={pr._id} style={styles.prCard}>
                                            <span style={styles.prName}>{pr.exercise}</span>
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                                                <span style={styles.prWeight} className="tabular-nums">
                                                    {pr.weight}
                                                </span>
                                                <span style={{ fontSize: '0.6875rem', color: '#71717a' }}>kg</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p style={styles.emptyText}>No verified PRs on file.</p>
                                )}
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
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
    },
    modalContent: {
        width: '100%',
        maxWidth: '560px',
        backgroundColor: '#121215',
        border: '1px solid #27272a',
        borderRadius: '8px',
        padding: '24px',
        position: 'relative',
        maxHeight: '85vh',
        overflowY: 'auto',
        boxSizing: 'border-box'
    },
    topActions: {
        position: 'absolute',
        top: '16px',
        right: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    kbd: {
        fontSize: '0.6875rem',
        color: '#71717a',
        border: '1px solid #27272a',
        borderRadius: '4px',
        padding: '1px 5px',
        fontFamily: 'monospace'
    },
    closeBtn: {
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
        alignItems: 'center'
    },
    modalHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        marginBottom: '20px'
    },
    avatar: {
        width: '44px',
        height: '44px',
        borderRadius: '6px',
        backgroundColor: '#18181b',
        border: '1px solid #27272a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.125rem',
        fontWeight: 600,
        color: '#f4f4f5'
    },
    name: {
        fontSize: '1.125rem',
        fontWeight: 600,
        color: '#f4f4f5',
        margin: 0
    },
    subtitle: {
        fontSize: '0.75rem',
        color: '#71717a'
    },
    statsBar: {
        display: 'flex',
        gap: '16px',
        backgroundColor: '#18181b',
        border: '1px solid #27272a',
        borderRadius: '6px',
        padding: '12px 16px'
    },
    privateNotice: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%'
    },
    statItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flex: 1
    },
    statLabel: {
        display: 'block',
        fontSize: '0.6875rem',
        color: '#71717a'
    },
    statVal: {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: 600,
        color: '#f4f4f5'
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
    },
    dayRow: {
        backgroundColor: '#18181b',
        border: '1px solid #27272a',
        borderRadius: '6px',
        padding: '10px 12px',
        cursor: 'pointer'
    },
    daySummary: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    dayLabel: {
        fontSize: '0.8125rem',
        fontWeight: 500,
        color: '#f4f4f5'
    },
    dayExCount: {
        fontSize: '0.75rem',
        color: '#71717a'
    },
    expandedExercises: {
        marginTop: '8px',
        paddingTop: '8px',
        borderTop: '1px solid #27272a',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    exSubRow: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.75rem'
    },
    prGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: '8px'
    },
    prCard: {
        backgroundColor: '#18181b',
        border: '1px solid #27272a',
        borderRadius: '6px',
        padding: '8px 10px'
    },
    prName: {
        display: 'block',
        fontSize: '0.75rem',
        color: '#a1a1aa',
        marginBottom: '2px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    prWeight: {
        fontSize: '0.9375rem',
        fontWeight: 600,
        color: '#f4f4f5'
    },
    emptyText: {
        fontSize: '0.75rem',
        color: '#71717a',
        margin: 0
    }
}

export default FriendProfileModal
