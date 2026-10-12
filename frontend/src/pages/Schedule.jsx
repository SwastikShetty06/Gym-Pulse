import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { Plus, Trash2, Check, Minus } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const Schedule = () => {
    const { token } = useAuthStore()
    const { addToast } = useToastStore()
    const [searchParams, setSearchParams] = useSearchParams()

    // URL is Single Source of Truth
    const dayParam = searchParams.get('day')
    const activeDay = DAYS.includes(dayParam) ? dayParam : 'Monday'

    const setActiveDay = (day) => {
        setSearchParams({ day })
    }

    const [schedules, setSchedules] = useState([])
    const [exercises, setExercises] = useState([])
    const [exerciseLibrary, setExerciseLibrary] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

    const rollbackSnapshotRef = useRef([])
    const draftKey = `gympulse_draft_schedule_${activeDay}`

    // Fetch initial schedule and exercise library
    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { 'x-auth-token': token } }
                const [schedRes, libRes] = await Promise.all([
                    axios.get('/api/schedule', config),
                    axios.get('/api/exercises', config)
                ])
                setSchedules(schedRes.data || [])
                setExerciseLibrary(libRes.data || [])

                // Check for locally saved draft first
                const savedDraft = localStorage.getItem(draftKey)
                if (savedDraft) {
                    try {
                        const parsed = JSON.parse(savedDraft)
                        setExercises(parsed)
                        setHasUnsavedChanges(true)
                        rollbackSnapshotRef.current = schedRes.data.find(s => s.day === activeDay)?.exercises || []
                        setLoading(false)
                        return
                    } catch {
                        localStorage.removeItem(draftKey)
                    }
                }

                const current = schedRes.data.find(s => s.day === activeDay)
                const initialExercises = current ? current.exercises : []
                setExercises(initialExercises)
                rollbackSnapshotRef.current = initialExercises
            } catch (err) {
                console.error(err)
                addToast({
                    message: `Failed to load routines: ${err.message}`,
                    type: 'error'
                })
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [token])

    // Synchronize exercise list when activeDay changes
    useEffect(() => {
        const savedDraft = localStorage.getItem(draftKey)
        if (savedDraft) {
            try {
                const parsed = JSON.parse(savedDraft)
                setExercises(parsed)
                setHasUnsavedChanges(true)
                const serverCurrent = schedules.find(s => s.day === activeDay)
                rollbackSnapshotRef.current = serverCurrent ? serverCurrent.exercises : []
                return
            } catch {
                localStorage.removeItem(draftKey)
            }
        }

        const current = schedules.find(s => s.day === activeDay)
        const dayExercises = current ? current.exercises : []
        setExercises(dayExercises)
        rollbackSnapshotRef.current = dayExercises
        setHasUnsavedChanges(false)
    }, [activeDay, schedules, draftKey])

    // Optimistic mutation: Add exercise
    const addExercise = useCallback(() => {
        const updated = [...exercises, { name: '', sets: 3, reps: '10' }]
        setExercises(updated)
        setHasUnsavedChanges(true)
        localStorage.setItem(draftKey, JSON.stringify(updated))
    }, [exercises, draftKey])

    // Optimistic mutation: Update exercise
    const updateExercise = (index, field, value) => {
        const updated = exercises.map((item, i) => {
            if (i === index) {
                return { ...item, [field]: value }
            }
            return item
        })
        setExercises(updated)
        setHasUnsavedChanges(true)
        localStorage.setItem(draftKey, JSON.stringify(updated))
    }

    // Quick set counter increment/decrement for mobile
    const adjustSets = (index, delta) => {
        const currentSets = Number(exercises[index]?.sets) || 1
        const newSets = Math.max(1, Math.min(20, currentSets + delta))
        updateExercise(index, 'sets', newSets)
    }

    // Optimistic mutation: Remove exercise
    const removeExercise = (index) => {
        const updated = exercises.filter((_, i) => i !== index)
        setExercises(updated)
        setHasUnsavedChanges(true)
        localStorage.setItem(draftKey, JSON.stringify(updated))
    }

    // Save schedule with optimistic update & rollback error toast
    const saveSchedule = async () => {
        if (saving) return
        setSaving(true)

        const previousExercises = rollbackSnapshotRef.current
        const previousSchedules = [...schedules]

        // Optimistically update schedule list in memory
        const optimisticSchedules = schedules.filter(s => s.day !== activeDay)
        setSchedules([...optimisticSchedules, { day: activeDay, exercises }])
        setHasUnsavedChanges(false)
        localStorage.removeItem(draftKey)

        addToast({
            message: `${activeDay} routine saved successfully`,
            type: 'success'
        })

        try {
            const res = await axios.post(
                '/api/schedule',
                { day: activeDay, exercises },
                { headers: { 'x-auth-token': token } }
            )
            rollbackSnapshotRef.current = res.data.exercises || exercises
        } catch (err) {
            setExercises(previousExercises)
            setSchedules(previousSchedules)
            rollbackSnapshotRef.current = previousExercises
            setHasUnsavedChanges(true)
            localStorage.setItem(draftKey, JSON.stringify(previousExercises))

            addToast({
                message: `Server failed to persist routine: ${err.message}`,
                type: 'error',
                action: {
                    label: 'Retry',
                    onClick: () => saveSchedule()
                }
            })
        } finally {
            setSaving(false)
        }
    }

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault()
                saveSchedule()
                return
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault()
                addExercise()
                return
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [saveSchedule, addExercise])

    return (
        <div style={styles.container} className="schedule-container">
            {/* Header */}
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <h1>Weekly Split</h1>
                    <p style={styles.headerSub}>
                        Program exercise volume for each session.
                    </p>
                </div>
                <div style={styles.headerActions}>
                    {hasUnsavedChanges && (
                        <span style={styles.unsavedBadge}>Draft</span>
                    )}
                    <button
                        onClick={saveSchedule}
                        disabled={saving}
                        className="btn-primary"
                        style={styles.saveBtn}
                    >
                        <Check size={14} />
                        <span>{saving ? 'Saving...' : 'Save'}</span>
                    </button>
                </div>
            </header>

            {/* Horizontal Day Selector (Touch-Scrollable strip) */}
            <div style={styles.daySelector} className="day-selector" role="tablist">
                {DAYS.map((day, index) => {
                    const isActive = activeDay === day
                    return (
                        <button
                            key={day}
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => setActiveDay(day)}
                            style={{
                                ...styles.dayBtn,
                                backgroundColor: isActive ? '#18181b' : 'transparent',
                                borderColor: isActive ? '#3b82f6' : '#27272a',
                                color: isActive ? '#f4f4f5' : '#71717a'
                            }}
                        >
                            <span style={styles.dayShortName}>{DAY_SHORT[index]}</span>
                            <span style={styles.dayIndexNumber} className="tabular-nums">
                                {index + 1}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* Routine Planner Card */}
            <section style={styles.plannerCard} className="planner-card">
                <div style={styles.cardHeader}>
                    <div>
                        <h2>{activeDay} Routine</h2>
                        <span style={styles.exerciseCount} className="tabular-nums">
                            {exercises.length} {exercises.length === 1 ? 'movement' : 'movements'}
                        </span>
                    </div>

                    <button
                        onClick={addExercise}
                        className="btn-secondary"
                        style={styles.addBtn}
                        title="Add Movement"
                    >
                        <Plus size={14} />
                        <span>Add Movement</span>
                    </button>
                </div>

                {loading ? (
                    <div style={styles.loadingContainer}>
                        <span>Loading routines...</span>
                    </div>
                ) : exercises.length === 0 ? (
                    <div style={styles.emptyState}>
                        <p style={styles.emptyTitle}>No movements programmed for {activeDay}</p>
                        <p style={styles.emptySubtitle}>
                            Tap below to program target sets and reps.
                        </p>
                        <button
                            onClick={addExercise}
                            className="btn-primary"
                            style={{ marginTop: '12px', width: '100%' }}
                        >
                            <Plus size={14} /> Add Movement
                        </button>
                    </div>
                ) : (
                    <div style={styles.movementList}>
                        {exercises.map((ex, index) => (
                            <div key={index} style={styles.movementCard} className="movement-card">
                                {/* Movement Name Input (Full width on smartphone) */}
                                <div style={{ width: '100%' }}>
                                    <input
                                        type="text"
                                        placeholder="Exercise name (e.g. Bench Press)"
                                        list="exercise-options"
                                        value={ex.name}
                                        onChange={(e) => updateExercise(index, 'name', e.target.value)}
                                        style={styles.nameInput}
                                    />
                                    <datalist id="exercise-options">
                                        {exerciseLibrary.map((lib) => (
                                            <option key={lib._id || lib.name} value={lib.name} />
                                        ))}
                                    </datalist>
                                </div>

                                {/* Set & Rep Controls Row */}
                                <div style={styles.metricsRow}>
                                    {/* Sets stepper */}
                                    <div style={styles.metricGroup}>
                                        <span style={styles.metricLabel}>Sets</span>
                                        <div style={styles.stepperContainer}>
                                            <button
                                                type="button"
                                                onClick={() => adjustSets(index, -1)}
                                                style={styles.stepperBtn}
                                                aria-label="Decrease sets"
                                            >
                                                <Minus size={12} />
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                max="30"
                                                value={ex.sets}
                                                onChange={(e) => updateExercise(index, 'sets', Number(e.target.value))}
                                                style={styles.stepperInput}
                                                className="tabular-nums"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => adjustSets(index, 1)}
                                                style={styles.stepperBtn}
                                                aria-label="Increase sets"
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Reps Input */}
                                    <div style={styles.metricGroup}>
                                        <span style={styles.metricLabel}>Reps</span>
                                        <input
                                            type="text"
                                            placeholder="8-12"
                                            value={ex.reps}
                                            onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                                            style={styles.repsInput}
                                            className="tabular-nums"
                                        />
                                    </div>

                                    {/* Delete Button */}
                                    <div style={{ marginLeft: 'auto', alignSelf: 'flex-end' }}>
                                        <button
                                            type="button"
                                            onClick={() => removeExercise(index)}
                                            style={styles.removeBtn}
                                            title="Delete movement"
                                            aria-label="Delete movement"
                                        >
                                            <Trash2 size={16} color="#ef4444" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Bottom Actions for Mobile */}
                        <div style={styles.bottomActionBar}>
                            <button
                                onClick={addExercise}
                                className="btn-secondary"
                                style={{ flex: 1 }}
                            >
                                <Plus size={14} /> Add Movement
                            </button>
                            <button
                                onClick={saveSchedule}
                                disabled={saving}
                                className="btn-primary"
                                style={{ flex: 1 }}
                            >
                                <Check size={14} /> {saving ? 'Saving...' : 'Save Routine'}
                            </button>
                        </div>
                    </div>
                )}
            </section>
        </div>
    )
}

const styles = {
    container: {
        padding: '16px',
        maxWidth: '1080px',
        margin: '0 auto',
        minHeight: '100%',
        boxSizing: 'border-box'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        marginBottom: '16px',
        borderBottom: '1px solid #27272a',
        paddingBottom: '12px'
    },
    headerLeft: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px'
    },
    headerSub: {
        fontSize: '0.8125rem',
        color: '#a1a1aa'
    },
    headerActions: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    unsavedBadge: {
        fontSize: '0.6875rem',
        color: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        padding: '3px 6px',
        borderRadius: '4px',
        fontWeight: 500
    },
    saveBtn: {
        padding: '8px 14px',
        gap: '6px',
        fontSize: '0.8125rem',
        minHeight: '38px'
    },
    daySelector: {
        display: 'flex',
        gap: '6px',
        backgroundColor: '#121215',
        border: '1px solid #27272a',
        borderRadius: '8px',
        padding: '6px',
        marginBottom: '16px',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch'
    },
    dayBtn: {
        flex: 1,
        minWidth: '44px',
        minHeight: '46px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2px',
        padding: '6px 8px',
        borderRadius: '6px',
        border: '1px solid #27272a',
        cursor: 'pointer',
        fontSize: '0.75rem',
        fontWeight: 500,
        touchAction: 'manipulation'
    },
    dayShortName: {
        fontSize: '0.75rem',
        fontWeight: 600
    },
    dayIndexNumber: {
        fontSize: '0.6875rem',
        color: '#71717a'
    },
    plannerCard: {
        backgroundColor: '#121215',
        border: '1px solid #27272a',
        borderRadius: '8px',
        padding: '16px'
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px'
    },
    exerciseCount: {
        fontSize: '0.75rem',
        color: '#71717a'
    },
    addBtn: {
        padding: '6px 12px',
        gap: '6px',
        fontSize: '0.8125rem',
        minHeight: '36px'
    },
    loadingContainer: {
        padding: '36px',
        textAlign: 'center',
        color: '#71717a',
        fontSize: '0.875rem'
    },
    emptyState: {
        padding: '32px 16px',
        textAlign: 'center',
        border: '1px dashed #27272a',
        borderRadius: '8px',
        backgroundColor: '#18181b'
    },
    emptyTitle: {
        fontSize: '0.875rem',
        fontWeight: 500,
        color: '#f4f4f5',
        marginBottom: '4px'
    },
    emptySubtitle: {
        fontSize: '0.8125rem',
        color: '#71717a'
    },
    movementList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    movementCard: {
        backgroundColor: '#18181b',
        border: '1px solid #27272a',
        borderRadius: '8px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    nameInput: {
        width: '100%',
        backgroundColor: '#121215',
        border: '1px solid #27272a',
        color: '#f4f4f5',
        fontSize: '0.875rem',
        padding: '10px 12px',
        borderRadius: '6px',
        boxSizing: 'border-box'
    },
    metricsRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    metricGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    metricLabel: {
        fontSize: '0.6875rem',
        color: '#71717a',
        textTransform: 'uppercase',
        letterSpacing: '0.04em'
    },
    stepperContainer: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#121215',
        border: '1px solid #27272a',
        borderRadius: '6px',
        overflow: 'hidden'
    },
    stepperBtn: {
        width: '32px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        border: 'none',
        color: '#a1a1aa',
        cursor: 'pointer'
    },
    stepperInput: {
        width: '38px',
        height: '36px',
        backgroundColor: 'transparent',
        border: 'none',
        color: '#f4f4f5',
        fontSize: '0.875rem',
        textAlign: 'center',
        padding: '0',
        fontWeight: 600
    },
    repsInput: {
        width: '80px',
        height: '36px',
        backgroundColor: '#121215',
        border: '1px solid #27272a',
        color: '#f4f4f5',
        fontSize: '0.875rem',
        textAlign: 'center',
        borderRadius: '6px',
        padding: '4px 8px'
    },
    removeBtn: {
        width: '36px',
        height: '36px',
        borderRadius: '6px',
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
    },
    bottomActionBar: {
        display: 'flex',
        gap: '10px',
        marginTop: '12px'
    }
}

export default Schedule
