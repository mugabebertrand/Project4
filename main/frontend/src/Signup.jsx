import { useState } from 'react'

function Signup({ onSignup }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agree, setAgree] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!agree) {
      setError('Please agree to the terms')
      return
    }
    setLoading(true)
    try {
      await onSignup(name, email, password)
    } catch (err) {
      setError(err?.response?.data?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <h2>Create Account</h2>
      <form className="card" onSubmit={handleSubmit}>
        {error && <div className="error">{error}</div>}
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </label>
        <label>
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> I agree to the Terms
        </label>
        <button className="btn" disabled={loading}>
          {loading ? 'Creating…' : 'Sign Up'}
        </button>
      </form>
    </div>
  )
}

export default Signup
