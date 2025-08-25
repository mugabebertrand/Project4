import { useEffect, useMemo, useState } from 'react'
import {
  getCategories,
  getQuestionsByCategory,
  getAnswersByQuestion,
  postQuestion,
  postAnswer,
} from './api-helpers.js'

function Dashboard({ user }) {
  const [categories, setCategories] = useState([])
  const [selectedCat, setSelectedCat] = useState(null)
  const [questions, setQuestions] = useState([])
  const [selectedQ, setSelectedQ] = useState(null)
  const [answers, setAnswers] = useState([])

  const [loadingQ, setLoadingQ] = useState(false)
  const [loadingA, setLoadingA] = useState(false)
  const [error, setError] = useState('')
  const [newQuestion, setNewQuestion] = useState('')
  const [newAnswer, setNewAnswer] = useState('')

  useEffect(() => {
    getCategories()
      .then(({ data }) => {
        setCategories(data)
        if (data.length && !selectedCat) setSelectedCat(data[0].id)
      })
      .catch(() => setError('Failed to load categories'))
  }, [])

  useEffect(() => {
    if (!selectedCat) { setQuestions([]); setSelectedQ(null); return }
    setLoadingQ(true)
    getQuestionsByCategory(selectedCat)
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : []
        setQuestions(list)
        setSelectedQ(list.length ? list[0].id : null)
      })
      .catch(() => setError('Failed to load questions'))
      .finally(() => setLoadingQ(false))
  }, [selectedCat])

  useEffect(() => {
    if (!selectedQ) { setAnswers([]); return }
    setLoadingA(true)
    getAnswersByQuestion(selectedQ)
      .then(({ data }) => setAnswers(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load answers'))
      .finally(() => setLoadingA(false))
  }, [selectedQ])

  async function handleAsk(e) {
    e.preventDefault()
    if (!newQuestion.trim()) return
    try {
      await postQuestion(selectedCat, newQuestion.trim())
      setNewQuestion('')
      const { data } = await getQuestionsByCategory(selectedCat)
      setQuestions(data)
      if (data.length) setSelectedQ(data[0].id)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to post question')
    }
  }

  async function handleAnswer(e) {
    e.preventDefault()
    if (!newAnswer.trim() || !selectedQ) return
    try {
      await postAnswer(selectedQ, newAnswer.trim())
      setNewAnswer('')
      const { data } = await getAnswersByQuestion(selectedQ)
      setAnswers(data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to post answer')
    }
  }

  const catName = useMemo(
    () => categories.find(c => c.id === selectedCat)?.name || '',
    [categories, selectedCat]
  )

  return (
    <div className="page">
      <h2>Dashboard</h2>
      <p>Welcome, <strong>{user?.name || user?.email}</strong></p>

      <div className="grid">
        <aside className="scroll">
          <h3>Categories</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {categories.map(c => (
              <li key={c.id}>
                <button
                  className="btn"
                  style={{ marginBottom: 8, opacity: selectedCat === c.id ? 0.85 : 1 }}
                  onClick={() => setSelectedCat(c.id)}
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main>
          <h3>{selectedCat ? `Questions — ${catName}` : 'Select a Category'}</h3>

          {selectedCat && (
            <form onSubmit={handleAsk} className="card" style={{ marginBottom: 16 }}>
              <label>
                Ask a question
                <input
                  value={newQuestion}
                  onChange={e => setNewQuestion(e.target.value)}
                  placeholder="Type your question…"
                />
              </label>
              <button className="btn" disabled={!newQuestion.trim()}>Post Question</button>
            </form>
          )}

          {loadingQ && <p>Loading questions…</p>}
          {!loadingQ && questions.length === 0 && selectedCat && <p>No questions yet.</p>}
          {!loadingQ && questions.map(q => (
            <article
              key={q.id}
              className="card"
              onClick={() => setSelectedQ(q.id)}
              style={{
                marginBottom: 12,
                border: selectedQ === q.id ? '1px solid var(--accent)' : undefined,
                cursor: 'pointer'
              }}
            >
              <h4 style={{ marginTop: 0 }}>{q.title}</h4>
            </article>
          ))}
        </main>

        <section>
          <h3>Answers</h3>
          {!selectedQ && <p>Select a question to view answers.</p>}

          {selectedQ && (
            <>
              <form onSubmit={handleAnswer} className="card" style={{ marginBottom: 12 }}>
                <label>
                  Your answer
                  <textarea
                    rows={3}
                    value={newAnswer}
                    onChange={e => setNewAnswer(e.target.value)}
                    placeholder="Write your answer…"
                  />
                </label>
                <button className="btn" disabled={!newAnswer.trim()}>Post Answer</button>
              </form>

              {loadingA && <p>Loading answers…</p>}
              {!loadingA && answers.length === 0 && <p>No answers yet.</p>}
              {!loadingA && answers.map(a => (
                <div key={a.id} className="card">
                  <div style={{ whiteSpace: 'pre-wrap' }}>{a.answer}</div>
                </div>
              ))}
            </>
          )}
        </section>
      </div>

      {error && <div className="error" style={{ marginTop: 12 }}>{error}</div>}
    </div>
  )
}

export default Dashboard
