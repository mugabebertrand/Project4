import { useEffect, useState } from 'react'
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import Login from './Login.jsx'
import Signup from './Signup.jsx'
import Dashboard from './Dashboard.jsx'
import { login as apiLogin, signup as apiSignup } from './api.js'

function Protected({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const profile = localStorage.getItem('profile')
    if (profile) setUser(JSON.parse(profile))
  }, [])

  const handleLogin = async (email, password) => {
    const { data } = await apiLogin(email, password)
    localStorage.setItem('token', data.token)
    localStorage.setItem('profile', JSON.stringify(data.user))
    setUser(data.user)
    navigate('/dashboard')
  }

  const handleSignup = async (name, email, password) => {
    const { data } = await apiSignup(name, email, password)
    localStorage.setItem('token', data.token)
    localStorage.setItem('profile', JSON.stringify(data.user))
    setUser(data.user)
    navigate('/dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('profile')
    setUser(null)
    navigate('/login')
  }

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup onSignup={handleSignup} />} />
        <Route
          path="/dashboard"
          element={
            <Protected>
              <Dashboard user={user} />
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

function Home() {
  return (
    <div className="page">
      <h1>Project 4</h1>
      <p>A minimal React frontend for my 3-tier Project 4.</p>
      <p>
        <Link className="btn" to="/signup">Get Started</Link>
      </p>
    </div>
  )
}
