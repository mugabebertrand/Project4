import { Link } from 'react-router-dom'

function Navbar({ user, onLogout }) {
  return (
    <nav>
      <div className="brand">
        <Link to="/">Project4</Link>
      </div>
      <div>
        {!user ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        ) : (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <button className="btn" onClick={onLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
