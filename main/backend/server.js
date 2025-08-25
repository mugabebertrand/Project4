const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const db = require('./db'); // mysql2/promise pool

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

app.use(cors({
  origin: ['http://localhost:5173', 'https://mugabebertrand.github.io'],
  credentials: false
}));
app.use(express.json());

/* ---------- Friendly roots (optional) ---------- */
app.get('/', (_req, res) => {
  res.send(
    'Project4 backend is running. Try <a href="/api">/api</a> or ' +
    '<a href="/api/categories">/api/categories</a>.'
  );
});

app.get('/api', (_req, res) => {
  res.send(
    'Welcome to Project4 API. Endpoints: ' +
    '<ul>' +
      '<li>GET /api/categories</li>' +
      '<li>GET /api/questions</li>' +
      '<li>GET /api/questions/by-category/:id</li>' +
      '<li>POST /api/questions</li>' +
      '<li>GET /api/answers</li>' +
      '<li>GET /api/answers/by-question/:id</li>' +
      '<li>POST /api/answers</li>' +
      '<li>POST /api/auth/signup</li>' +
      '<li>POST /api/auth/login</li>' +
    '</ul>'
  );
});

/* ---------- Auth ---------- */
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, password required' });
    }
    const [ex] = await db.query('SELECT id FROM Users WHERE email=?', [email]);
    if (ex.length) return res.status(409).json({ message: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const [r] = await db.query(
      'INSERT INTO Users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, hash]
    );

    const user = { id: r.insertId, name, email };
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Signup failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password required' });
    }
    const [rows] = await db.query(
      'SELECT id, name, email, password_hash FROM Users WHERE email=?',
      [email]
    );
    if (!rows.length) return res.status(401).json({ message: 'Invalid email or password' });

    const u = rows[0];
    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: u.id, email: u.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id: u.id, name: u.name, email: u.email }, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Login failed' });
  }
});

/* ---------- Categories ---------- */
app.get('/api/categories', async (_req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT CategoryID AS id, CategoryName AS name FROM Categories ORDER BY CategoryName'
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

/* ---------- Questions ---------- */
// NEW: list all questions
app.get('/api/questions', async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT q.QuestionID AS id,
              q.question    AS title,
              q.CategoryID  AS category_id
       FROM Questions q
       ORDER BY q.QuestionID DESC`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error fetching questions' });
  }
});

// existing: list questions by category
app.get('/api/questions/by-category/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [rows] = await db.query(
      `SELECT QuestionID AS id, question AS title, CategoryID AS category_id
       FROM Questions WHERE CategoryID=? ORDER BY QuestionID DESC`,
      [id]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error fetching questions' });
  }
});

// existing: create question
app.post('/api/questions', async (req, res) => {
  try {
    const { categoryId, title } = req.body || {};
    if (!categoryId || !title) {
      return res.status(400).json({ message: 'categoryId and title required' });
    }
    const [r] = await db.query(
      'INSERT INTO Questions (question, CategoryID) VALUES (?, ?)',
      [title.trim(), Number(categoryId)]
    );
    res.status(201).json({ id: r.insertId, title: title.trim(), category_id: Number(categoryId) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Create question failed' });
  }
});

/* ---------- Answers ---------- */
// NEW: list all answers
app.get('/api/answers', async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.AnswerID AS id,
              a.answer     AS answer,
              a.QuestionID AS question_id
       FROM Answers a
       ORDER BY a.AnswerID DESC`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error fetching answers' });
  }
});

// existing: list answers by question
app.get('/api/answers/by-question/:id', async (req, res) => {
  try {
    const qid = Number(req.params.id);
    const [rows] = await db.query(
      `SELECT a.AnswerID AS id,
              a.answer     AS answer,
              a.QuestionID AS question_id
       FROM Answers a
       WHERE a.QuestionID = ?
       ORDER BY a.AnswerID DESC`,
      [qid]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error fetching answers' });
  }
});

// existing: create answer
app.post('/api/answers', async (req, res) => {
  try {
    const { questionId, answer } = req.body || {};
    if (!questionId || !answer) {
      return res.status(400).json({ message: 'questionId and answer required' });
    }
    const [r] = await db.query(
      'INSERT INTO Answers (answer, QuestionID) VALUES (?, ?)',
      [answer, Number(questionId)]
    );
    res.status(201).json({ id: r.insertId, answer, question_id: Number(questionId) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Create answer failed' });
  }
});

/* ---------- Start ---------- */
app.listen(PORT, () => console.log(`✅ Server on http://localhost:${PORT}`));
