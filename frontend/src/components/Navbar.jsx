import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Calendar, ClipboardCheck, User, LogOut, Dumbbell, Zap, MapPin } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const Navbar = () => {
    const { logout, user } = useAuthStore()

    const navItems = [
        { path: '/', name: 'Dashboard', icon: LayoutDashboard },
        { path: '/schedule', name: 'Schedule', icon: Calendar },
        { path: '/attendance', name: 'Progress', icon: ClipboardCheck },
        { path: '/social', name: 'Social', icon: Zap },
        { path: '/my-gym', name: 'Clan', icon: MapPin },
        { path: '/profile', name: 'Profile', icon: User },
    ]

    return (
        <nav style={styles.navbar} className="navbar-side">
            <div style={styles.logoContainer} className="logo-container">
                <div style={styles.logoBadge} className="logo-badge">
                    <Dumbbell size={20} color="white" />
                </div>
                <h2 style={styles.logoText} className="logo-text">Gym<span className="gradient-text">Pulse</span></h2>
            </div>

            <div style={styles.navMenu} className="nav-menu">
                <p style={styles.menuLabel} className="menu-label">Menu</p>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        style={({ isActive }) => ({
                            ...styles.navLink,
                            ...(isActive ? styles.activeNavLink : {})
                        })}
                    >
                        {({ isActive }) => (
                            <>
                                <div className="icon-box" style={{
                                    ...styles.iconBox,
                                    background: isActive ? 'var(--accent-primary)' : 'rgba(255,255,255,0.03)',
                                    boxShadow: isActive ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
                                }}>
                                    <item.icon size={18} color={isActive ? 'white' : 'var(--text-secondary)'} />
                                </div>
                                <span style={styles.linkText} className="link-text">{item.name}</span>
                                {isActive && <div style={styles.activePill} className="active-pill" />}
                            </>
                        )}
                    </NavLink>
                ))}
            </div>

            <div style={styles.bottomSection} className="bottom-section">
                <div className="glass user-card" style={styles.userCard}>
                    <div style={styles.userAvatar} className="user-avatar">
                        <Zap size={14} fill="white" color="white" />
                    </div>
                    <div style={styles.userInfo} className="user-info">
                        <p style={styles.userName}>{user?.name.split(' ')[0]}</p>
                        <p style={styles.userRole}>Elite Plan</p>
                    </div>
                </div>

                <button onClick={logout} className="hover-lift logout-btn" style={styles.logoutBtn}>
                    <div className="icon-box" style={{ ...styles.iconBox, background: 'rgba(239, 68, 68, 0.1)' }}>
                        <LogOut size={18} color="var(--danger)" />
                    </div>
                    <span>Sign Out</span>
                </button>
            </div>
        </nav>
    )
}

const styles = {
    navbar: {
        width: '260px',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--glass-border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '2rem 1.5rem',
        zIndex: 1000,
        transition: 'all 0.3s ease'
    },
    logoContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '3.5rem',
        paddingLeft: '0.5rem'
    },
    logoBadge: {
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
    },
    logoText: {
        fontSize: '1.4rem',
        fontWeight: 800,
        letterSpacing: '-0.03em',
        fontFamily: 'var(--font-header)'
    },
    navMenu: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        flex: 1
    },
    menuLabel: {
        fontSize: '0.7rem',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'var(--text-secondary)',
        marginBottom: '1rem',
        paddingLeft: '0.75rem',
        fontWeight: 700
    },
    navLink: {
        textDecoration: 'none',
        color: 'var(--text-secondary)',
        fontSize: '0.95rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '0.875rem 1rem',
        borderRadius: '14px',
        transition: 'all 0.2s ease',
        position: 'relative'
    },
    activeNavLink: {
        color: 'white',
        background: 'rgba(255, 255, 255, 0.04)',
    },
    linkText: {
        transition: 'all 0.2s ease'
    },
    iconBox: {
        width: '34px',
        height: '34px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        flexShrink: 0
    },
    activePill: {
        position: 'absolute',
        left: '-1.5rem',
        width: '4px',
        height: '24px',
        background: 'var(--accent-primary)',
        borderRadius: '0 4px 4px 0',
        boxShadow: '0 0 12px var(--accent-primary)'
    },
    bottomSection: {
        marginTop: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    },
    userCard: {
        padding: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        borderRadius: '16px',
        border: '1px solid var(--glass-border)'
    },
    userAvatar: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    },
    userInfo: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
    },
    userName: {
        fontSize: '0.9rem',
        fontWeight: 700,
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    userRole: {
        fontSize: '0.75rem',
        color: 'var(--text-secondary)'
    },
    logoutBtn: {
        background: 'none',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '0.875rem 1rem',
        color: 'var(--danger)',
        fontWeight: 600,
        fontSize: '0.95rem',
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        borderRadius: '14px',
        transition: 'all 0.2s ease'
    }
}

// Inject mobile styles
if (typeof window !== 'undefined') {
    const styleSheet = document.createElement("style")
    styleSheet.innerText = `
        @media (max-width: 1024px) {
            .navbar-side {
                width: 80px !important;
                padding: 2rem 0.5rem !important;
                align-items: center !important;
            }
            .nav-link .link-text, .menu-label, .logo-text, .user-info, .logout-btn span { display: none !important; }
            .logo-container { padding: 0 !important; margin-bottom: 2rem !important; justify-content: center !important; }
            .user-card { padding: 0.5rem !important; border: none !important; background: none !important; justify-content: center !important; }
            .active-pill { left: -0.5rem !important; }
        }
        @media (max-width: 768px) {
            .navbar-side {
                top: auto !important;
                bottom: 0 !important;
                width: 100% !important;
                height: 70px !important;
                flex-direction: row !important;
                padding: 0 0.5rem !important;
                border-right: none !important;
                border-top: 1px solid var(--glass-border) !important;
                border-radius: 20px 20px 0 0 !important;
                align-items: center !important;
                justify-content: space-around !important;
                backdrop-filter: blur(20px) !important;
                -webkit-backdrop-filter: blur(20px) !important;
                background: rgba(14, 14, 17, 0.8) !important;
            }
            .logo-container, .menu-label, .bottom-section, .active-pill { display: none !important; }
            .nav-menu { flex-direction: row !important; width: 100% !important; justify-content: space-around !important; margin: 0 !important; align-items: center !important; }
            .nav-link { 
                padding: 0.5rem !important; 
                background: none !important; 
                flex-direction: column !important; 
                gap: 4px !important; 
                border-radius: 12px !important;
                flex: 1 !important;
                justify-content: center !important;
            }
            .nav-link .icon-box { 
                background: none !important; 
                box-shadow: none !important; 
                width: 24px !important; 
                height: 24px !important; 
                margin: 0 auto !important;
            }
            .nav-link.active .icon-box svg { color: var(--accent-primary) !important; }
            .nav-link .link-text { display: block !important; font-size: 0.65rem !important; text-align: center !important; }
            .nav-link.active .link-text { color: white !important; }
        }
    `
    document.head.appendChild(styleSheet)
}

export default Navbar
