import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Trash2, Save, MoreHorizontal } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const Schedule = () => {
    const { token } = useAuthStore()
    const [schedules, setSchedules] = useState([])
    const [activeDay, setActiveDay] = useState('Monday')
    const [exercises, setExercises] = useState([])
    const [exerciseLibrary, setExerciseLibrary] = useState([])
    const [loading, setLoading] = useState(true)

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { 'x-auth-token': token } }
                const [schedRes, libRes] = await Promise.all([
                    axios.get('/api/schedule', config),
                    axios.get('/api/exercises', config)
                ])
                setSchedules(schedRes.data)
                setExerciseLibrary(libRes.data)
                const current = schedRes.data.find(s => s.day === activeDay)
                setExercises(current ? current.exercises : [])
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [token])

    useEffect(() => {
        const current = schedules.find(s => s.day === activeDay)
        setExercises(current ? current.exercises : [])
    }, [activeDay, schedules])

    const addExercise = () => {
        setExercises([...exercises, { name: '', sets: 3, reps: '10-12' }])
    }

    const updateExercise = (index, field, value) => {
        const newEx = [...exercises]
        newEx[index][field] = value
        setExercises(newEx)
    }

    const remoteExercise = (index) => {
        setExercises(exercises.filter((_, i) => i !== index))
    }

    const saveSchedule = async () => {
        try {
            const res = await axios.post('/api/schedule', {
                day: activeDay,
                exercises
            }, { headers: { 'x-auth-token': token } })

            const newSchedules = schedules.filter(s => s.day !== activeDay)
            setSchedules([...newSchedules, res.data])
            alert('Schedule saved successfully!')
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="schedule-container" style={styles.container}>
            <header style={styles.header}>
                <h1 style={{ fontSize: '2.5rem' }}>Weekly <span className="gradient-text">Planner</span></h1>
                <p style={{ color: 'var(--text-secondary)' }}>Design your perfect workout routine</p>
            </header>

            <div className="day-selector" style={styles.daySelector}>
                {days.map(day => (
                    <button
                        key={day}
                        onClick={() => setActiveDay(day)}
                        className="glass"
                        style={{
                            ...styles.dayBtn,
                            background: activeDay === day ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                            color: activeDay === day ? 'white' : 'var(--text-secondary)'
                        }}
                    >
                        {day.substring(0, 3)}
                    </button>
                ))}
            </div>

            <div className="glass planner-card" style={styles.plannerCard}>
                <div style={styles.cardHeader}>
                    <h2>{activeDay} Routine</h2>
                    <button onClick={addExercise} className="btn-primary" style={styles.addBtn}>
                        <Plus size={18} /> Add Exercise
                    </button>
                </div>

                <div style={styles.exerciseGrid}>
                    {exercises.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem' }}>
                            No exercises added for {activeDay}. Get started!
                        </p>
                    ) : (
                        exercises.map((ex, i) => (
                            <div key={i} className="glass" style={styles.exCard}>
                                <div className="ex-main" style={styles.exMain}>
                                    <input
                                        placeholder="Exercise Name"
                                        list="exercise-options"
                                        value={ex.name}
                                        onChange={(e) => updateExercise(i, 'name', e.target.value)}
                                        style={styles.exInput}
                                    />
                                    <datalist id="exercise-options">
                                        {exerciseLibrary.map(lib => (
                                            <option key={lib._id} value={lib.name} />
                                        ))}
                                    </datalist>
                                    <div className="ex-stats" style={styles.exStats}>
                                        <div style={styles.statInput}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sets</span>
                                            <input
                                                type="number"
                                                value={ex.sets}
                                                onChange={(e) => updateExercise(i, 'sets', e.target.value)}
                                                style={styles.smallInput}
                                            />
                                        </div>
                                        <div style={styles.statInput}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Reps</span>
                                            <input
                                                value={ex.reps}
                                                onChange={(e) => updateExercise(i, 'reps', e.target.value)}
                                                style={styles.smallInput}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => remoteExercise(i)} style={styles.deleteBtn}>
                                    <Trash2 size={18} color="var(--danger)" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {exercises.length > 0 && (
                    <button onClick={saveSchedule} className="btn-primary" style={styles.saveBtn}>
                        <Save size={18} style={{ marginRight: '0.5rem' }} /> Save Changes
                    </button>
                )}
            </div>
        </div>
    )
}

const styles = {
    container: {
        padding: '2rem',
        minHeight: '100vh',
        maxWidth: '1200px',
        margin: '0 auto'
    },
    header: {
        marginBottom: '2rem'
    },
    daySelector: {
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '2rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem'
    },
    dayBtn: {
        padding: '0.75rem 1.25rem',
        borderRadius: '12px',
        minWidth: '80px',
        fontWeight: 600,
        border: '1px solid var(--glass-border)'
    },
    plannerCard: {
        padding: '1.5rem',
        minHeight: '400px'
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
    },
    addBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.6rem 1rem'
    },
    exerciseGrid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    },
    exCard: {
        padding: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        background: 'var(--bg-tertiary)'
    },
    exMain: {
        flex: 1,
        display: 'flex',
        gap: '1.5rem',
        alignItems: 'center'
    },
    exInput: {
        flex: 1,
        background: 'transparent',
        border: 'none',
        borderBottom: '2px solid var(--glass-border)',
        color: 'white',
        padding: '0.5rem',
        fontSize: '1.1rem',
        outline: 'none'
    },
    exStats: {
        display: 'flex',
        gap: '1rem'
    },
    statInput: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem'
    },
    smallInput: {
        width: '60px',
        background: 'var(--bg-primary)',
        border: '1px solid var(--glass-border)',
        borderRadius: '6px',
        color: 'white',
        padding: '0.4rem',
        textAlign: 'center'
    },
    deleteBtn: {
        background: 'transparent',
        padding: '0.5rem'
    },
    saveBtn: {
        marginTop: '2rem',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }
}

export default Schedule
