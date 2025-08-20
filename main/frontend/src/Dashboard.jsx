import { useEffect, useState } from 'react'
import api from './api.js'

function Dashboard({ user }) {
  const [categories, setCategories] = useState([])
  const [selected, setSelected] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)

  // Load categories for the left menu
  useEffect(() => {
    api.get('/api/categories').then(({ data }) => setCategories(data))
  }, [])

  // Load questions when a category is selected
  useEffect(() => {
    if (!selected) return
    setLoading(true)
    api
      .get(`/api/questions/by-category/${selected}`)
      .then(({ data }) => setQuestions(data.items || []))
      .finally(() => setLoading(false))
  }, [selected])

  return (
    <div className="page">
      <h2>Dashboard</h2>
      <p>Welcome, <strong>{user?.name || user?.email}</strong></p>

      <div className="grid">
        <aside className="scroll">
          <h3>Categories</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {categories.map((c) => (
              <li key={c._id}>
                <button
                  className="btn"
                  style={{ marginBottom: 8 }}
                  onClick={() => setSelected(c._id)}
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main>
          {!selected && <p>Select a Category to view its questions.</p>}
          {selected && (
            <>
              <h3>Questions</h3>
              {loading && <p>Loading…</p>}
              {!loading && questions.length === 0 && <p>No questions yet.</p>}
              {!loading &&
                questions.map((q) => (
                  <article key={q._id} className="card" style={{ marginBottom: 12 }}>
                    <h4 style={{ marginTop: 0 }}>{q.title}</h4>
                    <p>{q.body}</p>
                    <small>by {q.author?.name || q.author?.email}</small>
                  </article>
                ))}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default Dashboard
