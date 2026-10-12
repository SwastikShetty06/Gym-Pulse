import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Search,
    LayoutDashboard,
    Calendar,
    ClipboardCheck,
    Users,
    Shield,
    User,
    CheckCircle2,
    LogOut,
    ArrowRight
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'

export const CommandPalette = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef(null)
    const listRef = useRef(null)
    const navigate = useNavigate()
    const { logout } = useAuthStore()
    const { addToast } = useToastStore()

    // Command registry
    const commands = [
        {
            id: 'nav-dashboard',
            category: 'Navigation',
            title: 'Dashboard',
            subtitle: 'Overview, today\'s workout & consistency',
            icon: LayoutDashboard,
            shortcut: 'G D',
            action: () => navigate('/')
        },
        {
            id: 'nav-schedule',
            category: 'Navigation',
            title: 'Weekly Schedule',
            subtitle: 'View and edit your workout split',
            icon: Calendar,
            shortcut: 'G S',
            action: () => navigate('/schedule')
        },
        {
            id: 'nav-attendance',
            category: 'Navigation',
            title: 'Progress & Streaks',
            subtitle: 'Attendance logs, frequency and streak data',
            icon: ClipboardCheck,
            shortcut: 'G P',
            action: () => navigate('/attendance')
        },
        {
            id: 'nav-social',
            category: 'Navigation',
            title: 'Social Hub',
            subtitle: 'Athletes, following & profile inspection',
            icon: Users,
            shortcut: 'G N',
            action: () => navigate('/social')
        },
        {
            id: 'nav-clan',
            category: 'Navigation',
            title: 'Clan / Gym Hub',
            subtitle: 'Gym details and community rankings',
            icon: Shield,
            shortcut: 'G C',
            action: () => navigate('/my-gym')
        },
        {
            id: 'nav-profile',
            category: 'Navigation',
            title: 'Profile & PR Vault',
            subtitle: 'Personal records and account metrics',
            icon: User,
            shortcut: 'G U',
            action: () => navigate('/profile')
        },
        ...['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
            (day) => ({
                id: `day-${day.toLowerCase()}`,
                category: 'Schedule Jump',
                title: `${day} Routine`,
                subtitle: `Jump directly to ${day}'s exercise planner`,
                icon: Calendar,
                action: () => navigate(`/schedule?day=${day}`)
            })
        ),
        {
            id: 'action-checkin',
            category: 'Actions',
            title: 'Log Today\'s Workout',
            subtitle: 'Quick log attendance for current session',
            icon: CheckCircle2,
            action: () => {
                navigate('/')
                addToast({ message: 'Select your session duration on Dashboard to verify.', type: 'info' })
            }
        },
        {
            id: 'action-logout',
            category: 'Account',
            title: 'Sign Out',
            subtitle: 'Log out of current session',
            icon: LogOut,
            action: () => {
                logout()
                addToast({ message: 'Signed out successfully.', type: 'info' })
            }
        }
    ]

    const filteredCommands = commands.filter((cmd) => {
        if (!search.trim()) return true
        const q = search.toLowerCase()
        return (
            cmd.title.toLowerCase().includes(q) ||
            cmd.subtitle.toLowerCase().includes(q) ||
            cmd.category.toLowerCase().includes(q)
        )
    })

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setIsOpen((prev) => !prev)
            } else if (e.key === 'Escape' && isOpen) {
                e.preventDefault()
                setIsOpen(false)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen])

    useEffect(() => {
        setSelectedIndex(0)
    }, [search])

    useEffect(() => {
        if (isOpen) {
            setSearch('')
            setSelectedIndex(0)
            setTimeout(() => inputRef.current?.focus(), 20)
        }
    }, [isOpen])

    const handleInputKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1))
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (filteredCommands[selectedIndex]) {
                filteredCommands[selectedIndex].action()
                setIsOpen(false)
            }
        }
    }

    if (!isOpen) return null

    return (
        <div
            onClick={() => setIsOpen(false)}
            className="command-palette-backdrop"
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                zIndex: 100000,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                boxSizing: 'border-box'
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="command-palette-modal"
                style={{
                    width: '100%',
                    backgroundColor: '#121215',
                    border: '1px solid #27272a',
                    borderRadius: '8px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Search Bar */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 14px',
                        borderBottom: '1px solid #27272a',
                        gap: '10px'
                    }}
                >
                    <Search size={16} color="#71717a" style={{ flexShrink: 0 }} />
                    <input
                        ref={inputRef}
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleInputKeyDown}
                        placeholder="Type a command or jump to page..."
                        style={{
                            flex: 1,
                            backgroundColor: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: '#f4f4f5',
                            fontSize: '0.9375rem',
                            fontFamily: 'inherit',
                            padding: '4px 0'
                        }}
                    />
                    <button
                        onClick={() => setIsOpen(false)}
                        style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#71717a',
                            fontSize: '0.75rem',
                            padding: '4px 8px',
                            cursor: 'pointer'
                        }}
                    >
                        Close
                    </button>
                </div>

                {/* Commands List */}
                <div
                    ref={listRef}
                    style={{
                        maxHeight: '340px',
                        overflowY: 'auto',
                        padding: '6px'
                    }}
                >
                    {filteredCommands.length === 0 ? (
                        <div
                            style={{
                                padding: '28px 16px',
                                textAlign: 'center',
                                color: '#71717a',
                                fontSize: '0.8125rem'
                            }}
                        >
                            No matching commands for "{search}"
                        </div>
                    ) : (
                        filteredCommands.map((cmd, idx) => {
                            const isSelected = idx === selectedIndex
                            const IconComponent = cmd.icon

                            return (
                                <div
                                    key={cmd.id}
                                    data-active={isSelected}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                    onClick={() => {
                                        cmd.action()
                                        setIsOpen(false)
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '10px 12px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        backgroundColor: isSelected ? '#1c1c21' : 'transparent',
                                        border: `1px solid ${isSelected ? '#27272a' : 'transparent'}`,
                                        minHeight: '44px',
                                        touchAction: 'manipulation'
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '6px',
                                            backgroundColor: isSelected ? '#27272a' : '#18181b',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}
                                    >
                                        <IconComponent
                                            size={15}
                                            color={isSelected ? '#3b82f6' : '#a1a1aa'}
                                        />
                                    </div>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span
                                                style={{
                                                    fontSize: '0.875rem',
                                                    color: isSelected ? '#ffffff' : '#f4f4f5',
                                                    fontWeight: 500
                                                }}
                                            >
                                                {cmd.title}
                                            </span>
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '0.75rem',
                                                color: '#71717a',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}
                                        >
                                            {cmd.subtitle}
                                        </div>
                                    </div>

                                    {isSelected && (
                                        <ArrowRight size={14} color="#3b82f6" style={{ flexShrink: 0 }} />
                                    )}
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            <style>{`
                @media (min-width: 769px) {
                    .command-palette-backdrop {
                        padding-top: 15vh;
                    }
                    .command-palette-modal {
                        max-width: 560px;
                    }
                }
                @media (max-width: 768px) {
                    .command-palette-backdrop {
                        padding: 12px;
                        padding-top: 16px;
                    }
                    .command-palette-modal {
                        max-width: 100%;
                    }
                }
            `}</style>
        </div>
    )
}

export default CommandPalette
