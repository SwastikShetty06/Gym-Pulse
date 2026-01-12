import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import Schedule from './pages/Schedule'
import Attendance from './pages/Attendance'
import Profile from './pages/Profile'
import Social from './pages/Social'
import { useAuthStore } from './store/authStore'

function App() {
    const { user } = useAuthStore()

    return (
        <Router basename={import.meta.env.BASE_URL}>
            <div className="app-container">
                {user && <Navbar />}
                <main className="main-content">
                    <Routes>
                        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
                        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
                        <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
                        <Route path="/schedule" element={user ? <Schedule /> : <Navigate to="/login" />} />
                        <Route path="/attendance" element={user ? <Attendance /> : <Navigate to="/login" />} />
                        <Route path="/social" element={user ? <Social /> : <Navigate to="/login" />} />
                        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
                    </Routes>
                </main>
            </div>
        </Router>
    )
}

export default App
