import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard,
    Calendar,
    ClipboardCheck,
    Users,
    Shield,
    User,
    LogOut,
    Activity,
    Search
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export const Navbar = () => {
    const { logout, user } = useAuthStore()
    const navigate = useNavigate()

    const navItems = [
        { path: '/', name: 'Dashboard', shortName: 'Home', icon: LayoutDashboard },
        { path: '/schedule', name: 'Schedule', shortName: 'Split', icon: Calendar },
        { path: '/attendance', name: 'Progress', shortName: 'History', icon: ClipboardCheck },
        { path: '/social', name: 'Social', shortName: 'Network', icon: Users },
        { path: '/my-gym', name: 'Clan', shortName: 'Clan', icon: Shield },
    ]

    const triggerCommandPalette = () => {
        window.dispatchEvent(
            new KeyboardEvent('keydown', {
                key: 'k',
                metaKey: true,
                bubbles: true
            })
        )
    }

    return (
        <>
            {/* ================================================= */}
            {/* 1. MOBILE TOP APP BAR (Sticky header on <= 768px)  */}
            {/* ================================================= */}
            <header className="mobile-topbar" style={styles.mobileTopbar}>
                <div style={styles.mobileTopLeft} onClick={() => navigate('/')}>
                    <div style={styles.mobileLogoBadge}>
                        <Activity size={16} color="#ffffff" />
                    </div>
                    <span style={styles.mobileBrandTitle}>GymPulse</span>
                </div>

                <div style={styles.mobileTopRight}>
                    <button
                        onClick={triggerCommandPalette}
                        style={styles.mobileIconBtn}
                        aria-label="Search and command palette"
                        title="Search (Cmd+K)"
                    >
                        <Search size={16} color="#a1a1aa" />
                    </button>

                    <button
                        onClick={() => navigate('/profile')}
                        style={styles.mobileAvatarBtn}
                        aria-label="View user profile"
                        title="Profile"
                    >
                        {(user?.name?.[0] || 'A').toUpperCase()}
                    </button>
                </div>
            </header>

            {/* ================================================= */}
            {/* 2. MOBILE BOTTOM NAVIGATION (Thumb bar on <= 768px)*/}
            {/* ================================================= */}
            <nav className="mobile-bottom-nav" style={styles.mobileBottomNav}>
                {navItems.map((item) => {
                    const IconComponent = item.icon
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `mobile-nav-tab ${isActive ? 'active-tab' : ''}`
                            }
                            style={({ isActive }) => ({
                                ...styles.mobileTab,
                                color: isActive ? '#3b82f6' : '#71717a'
                            })}
                        >
                            {({ isActive }) => (
                                <>
                                    <div
                                        style={{
                                            ...styles.mobileTabIconWrapper,
                                            backgroundColor: isActive
                                                ? 'rgba(59, 130, 246, 0.12)'
                                                : 'transparent'
                                        }}
                                    >
                                        <IconComponent size={18} />
                                    </div>
                                    <span
                                        style={{
                                            ...styles.mobileTabLabel,
                                            fontWeight: isActive ? 600 : 500,
                                            color: isActive ? '#f4f4f5' : '#71717a'
                                        }}
                                    >
                                        {item.shortName}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    )
                })}
            </nav>

            {/* ================================================= */}
            {/* 3. DESKTOP SIDEBAR (Fixed rail on > 768px)         */}
            {/* ================================================= */}
            <aside className="desktop-sidebar" style={styles.desktopNavbar}>
                {/* Logo Header */}
                <div style={styles.logoContainer}>
                    <div style={styles.logoBadge}>
                        <Activity size={18} color="#ffffff" />
                    </div>
                    <div>
                        <h2 style={styles.logoText}>GymPulse</h2>
                        <span style={styles.logoSubtext}>Tier-1 Athletics</span>
                    </div>
                </div>

                {/* Command Palette Trigger */}
                <button
                    onClick={triggerCommandPalette}
                    style={styles.searchTrigger}
                    className="command-trigger"
                    title="Open Command Palette (Cmd+K)"
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Search size={14} color="#71717a" />
                        <span style={{ fontSize: '0.8125rem', color: '#71717a' }}>Quick jump...</span>
                    </div>
                    <kbd style={styles.kbd}>⌘K</kbd>
                </button>

                {/* Navigation Menu */}
                <div style={styles.navMenu}>
                    <p style={styles.menuLabel}>Workspace</p>
                    {navItems.map((item) => {
                        const IconComponent = item.icon
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `nav-link ${isActive ? 'active' : ''}`
                                }
                                style={({ isActive }) => ({
                                    ...styles.navLink,
                                    ...(isActive ? styles.activeNavLink : {})
                                })}
                            >
                                {({ isActive }) => (
                                    <>
                                        <div
                                            style={{
                                                ...styles.iconBox,
                                                backgroundColor: isActive ? '#27272a' : 'transparent',
                                                color: isActive ? '#3b82f6' : '#a1a1aa'
                                            }}
                                            className="icon-box"
                                        >
                                            <IconComponent size={16} />
                                        </div>
                                        <span style={styles.linkText}>{item.name}</span>
                                    </>
                                )}
                            </NavLink>
                        )
                    })}

                    <NavLink
                        to="/profile"
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        style={({ isActive }) => ({
                            ...styles.navLink,
                            ...(isActive ? styles.activeNavLink : {})
                        })}
                    >
                        {({ isActive }) => (
                            <>
                                <div
                                    style={{
                                        ...styles.iconBox,
                                        backgroundColor: isActive ? '#27272a' : 'transparent',
                                        color: isActive ? '#3b82f6' : '#a1a1aa'
                                    }}
                                    className="icon-box"
                                >
                                    <User size={16} />
                                </div>
                                <span style={styles.linkText}>Profile</span>
                            </>
                        )}
                    </NavLink>
                </div>

                {/* Footer Profile & Logout */}
                <div style={styles.bottomSection}>
                    <div style={styles.userCard}>
                        <div style={styles.userAvatar}>
                            {(user?.name ? user.name[0] : 'A').toUpperCase()}
                        </div>
                        <div style={styles.userInfo}>
                            <span style={styles.userName}>{user?.name || 'Athlete'}</span>
                            <span style={styles.userRole}>{user?.email || 'Active Member'}</span>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        style={styles.logoutBtn}
                        className="logout-btn"
                        title="Sign Out"
                    >
                        <LogOut size={15} color="#ef4444" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    )
}

const styles = {
    // 1. Mobile Topbar
    mobileTopbar: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--mobile-topbar-height)',
        backgroundColor: '#121215',
        borderBottom: '1px solid #27272a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        zIndex: 9998,
        boxSizing: 'border-box'
    },
    mobileTopLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer'
    },
    mobileLogoBadge: {
        width: '26px',
        height: '26px',
        borderRadius: '6px',
        backgroundColor: '#18181b',
        border: '1px solid #27272a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    mobileBrandTitle: {
        fontSize: '0.9375rem',
        fontWeight: 600,
        color: '#f4f4f5',
        letterSpacing: '-0.02em'
    },
    mobileTopRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    mobileIconBtn: {
        width: '36px',
        height: '36px',
        borderRadius: '6px',
        backgroundColor: '#18181b',
        border: '1px solid #27272a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
    },
    mobileAvatarBtn: {
        width: '32px',
        height: '32px',
        borderRadius: '6px',
        backgroundColor: '#27272a',
        border: '1px solid #3f3f46',
        color: '#f4f4f5',
        fontSize: '0.8125rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
    },

    // 2. Mobile Bottom Nav
    mobileBottomNav: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'calc(var(--mobile-nav-height) + env(safe-area-inset-bottom, 0px))',
        backgroundColor: '#121215',
        borderTop: '1px solid #27272a',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-around',
        paddingTop: '6px',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        zIndex: 9998,
        boxSizing: 'border-box'
    },
    mobileTab: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
        gap: '2px',
        height: '46px',
        minWidth: '48px',
        touchAction: 'manipulation'
    },
    mobileTabIconWrapper: {
        width: '28px',
        height: '24px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    mobileTabLabel: {
        fontSize: '0.6875rem',
        letterSpacing: '0.01em'
    },

    // 3. Desktop Sidebar
    desktopNavbar: {
        width: '260px',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        backgroundColor: '#121215',
        borderRight: '1px solid #27272a',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 16px',
        zIndex: 1000,
        boxSizing: 'border-box'
    },
    logoContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '16px',
        paddingLeft: '4px'
    },
    logoBadge: {
        width: '30px',
        height: '30px',
        borderRadius: '6px',
        backgroundColor: '#18181b',
        border: '1px solid #27272a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    logoText: {
        fontSize: '1rem',
        fontWeight: 600,
        color: '#f4f4f5',
        lineHeight: 1.1,
        letterSpacing: '-0.02em',
        margin: 0
    },
    logoSubtext: {
        fontSize: '0.6875rem',
        color: '#71717a',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    },
    searchTrigger: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#18181b',
        border: '1px solid #27272a',
        borderRadius: '6px',
        padding: '8px 10px',
        marginBottom: '20px',
        cursor: 'pointer',
        width: '100%'
    },
    kbd: {
        fontSize: '0.6875rem',
        color: '#71717a',
        border: '1px solid #27272a',
        borderRadius: '4px',
        padding: '1px 5px',
        fontFamily: 'monospace'
    },
    navMenu: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        flex: 1
    },
    menuLabel: {
        fontSize: '0.6875rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: '#71717a',
        marginBottom: '6px',
        paddingLeft: '8px',
        fontWeight: 600
    },
    navLink: {
        textDecoration: 'none',
        color: '#a1a1aa',
        fontSize: '0.875rem',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '7px 8px',
        borderRadius: '6px',
        transition: 'background-color 100ms ease, color 100ms ease'
    },
    activeNavLink: {
        color: '#ffffff',
        backgroundColor: '#18181b'
    },
    iconBox: {
        width: '26px',
        height: '26px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    },
    linkText: {
        flex: 1
    },
    bottomSection: {
        marginTop: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        borderTop: '1px solid #27272a',
        paddingTop: '14px'
    },
    userCard: {
        padding: '6px 8px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        borderRadius: '6px',
        backgroundColor: '#18181b',
        border: '1px solid #27272a'
    },
    userAvatar: {
        width: '28px',
        height: '28px',
        borderRadius: '4px',
        backgroundColor: '#27272a',
        color: '#f4f4f5',
        fontWeight: 600,
        fontSize: '0.8125rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    },
    userInfo: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flex: 1
    },
    userName: {
        fontSize: '0.8125rem',
        fontWeight: 500,
        color: '#f4f4f5',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    userRole: {
        fontSize: '0.6875rem',
        color: '#71717a',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    logoutBtn: {
        background: 'transparent',
        border: '1px solid transparent',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '7px 8px',
        color: '#ef4444',
        fontWeight: 500,
        fontSize: '0.8125rem',
        width: '100%',
        cursor: 'pointer',
        borderRadius: '6px'
    }
}

// Responsive display switching
if (typeof window !== 'undefined') {
    const existingStyle = document.getElementById('navbar-mobile-responsive-styles')
    if (!existingStyle) {
        const styleSheet = document.createElement("style")
        styleSheet.id = 'navbar-mobile-responsive-styles'
        styleSheet.innerText = `
            @media (min-width: 769px) {
                .mobile-topbar, .mobile-bottom-nav {
                    display: none !important;
                }
                .desktop-sidebar {
                    display: flex !important;
                }
            }
            @media (max-width: 768px) {
                .desktop-sidebar {
                    display: none !important;
                }
                .mobile-topbar {
                    display: flex !important;
                }
                .mobile-bottom-nav {
                    display: flex !important;
                }
                .mobile-nav-tab:active {
                    background-color: #18181b;
                    border-radius: 6px;
                }
            }
        `
        document.head.appendChild(styleSheet)
    }
}

export default Navbar
