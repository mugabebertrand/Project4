
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const db = require('./db'); 

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';


app.use(helmet());
app.use(cors({
  origin: true, 
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));


app.get('/', (_req, res) => {
  res.send('Project4 backend root. Try GET /api for health, /api/categories for data.');
});
app.get('/api', (_req, res) => {
  res.send('Welcome to Project4 API!');
});


function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}


app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    const [existing] = await db.query('SELECT id FROM Users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO Users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, hash]
    );
    const user = { id: result.insertId, name, email };
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Signup failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const [rows] = await db.query(
      'SELECT id, name, email, password_hash FROM Users WHERE email = ?',
      [email]
    );
    if (!rows.length) return res.status(401).json({ message: 'Incorrect email or password' });
    const u = rows[0];
    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return res.status(401).json({ message: 'Incorrect email or password' });
    const token = jwt.sign({ id: u.id, email: u.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id: u.id, name: u.name, email: u.email }, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
});


app.get('/api/categories', async (req, res) => {
  try {
    if (req.query.id) {
      const id = Number(req.query.id);
      if (!Number.isInteger(id)) return res.status(400).json({ message: 'Invalid category ID' });
      const [single] = await db.query(
        'SELECT CategoryID AS id, CategoryName AS name FROM Categories WHERE CategoryID = ?',
        [id]
      );
      if (!single.length) return res.status(404).json({ message: 'Category not found' });
      return res.json(single[0]);
    }
    const [rows] = await db.query(
      'SELECT CategoryID AS id, CategoryName AS name FROM Categories ORDER BY CategoryName'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

app.get('/api/categories/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ message: 'Invalid category ID' });
  try {
    const [rows] = await db.query(
      'SELECT CategoryID AS id, CategoryName AS name FROM Categories WHERE CategoryID = ?',
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Category not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching category:', err);
    res.status(500).json({ message: 'Error fetching category' });
  }
});


app.get('/categories/:id', (req, res) => res.redirect(301, `/api/categories/${req.params.id}`));
app.get('/categories', (_req, res) => res.redirect(301, `/api/categories`));
app.get('/api/category/:id', (req, res) => res.redirect(301, `/api/categories/${req.params.id}`));


app.get('/api/questions', async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT q.QuestionID AS _id,
              q.question    AS title,
              ''            AS body,
              q.CategoryID  AS category_id
       FROM Questions q
       ORDER BY q.QuestionID DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ message: 'Error fetching questions' });
  }
});


app.get('/api/questions/by-category/:id', async (req, res) => {
  try {
    const catId = Number(req.params.id);
    if (!Number.isInteger(catId)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }
    const [rows] = await db.query(
      `SELECT q.QuestionID AS _id,
              q.question    AS title,
              ''            AS body,
              q.CategoryID  AS category_id
       FROM Questions q
       WHERE q.CategoryID = ?
       ORDER BY q.QuestionID DESC`,
      [catId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching questions by category:', err);
    res.status(500).json({ message: 'Error fetching questions' });
  }
});


app.post('/api/questions', authMiddleware, async (req, res) => {
  try {
    const { categoryId, title } = req.body || {};
    if (!categoryId || !title || !title.trim()) {
      return res.status(400).json({ message: 'categoryId and title are required' });
    }
    const [result] = await db.query(
      'INSERT INTO Questions (question, CategoryID) VALUES (?, ?)',
      [title.trim(), Number(categoryId)]
    );
    res.status(201).json({
      _id: result.insertId,
      title: title.trim(),
      body: '',
      category_id: Number(categoryId),
    });
  } catch (err) {
    console.error('Create question error:', err);
    res.status(500).json({ message: 'Create question failed' });
  }
});


app.get('/api/answers', async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.AnswerID AS id,
              a.answer     AS answer,
              a.QuestionID AS question_id,
              a.author_id
       FROM Answers a
       ORDER BY a.AnswerID DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching answers:', err);
    res.status(500).json({ message: 'Error fetching answers' });
  }
});


app.get('/api/answers/by-question/:id', async (req, res) => {
  try {
    const qid = Number(req.params.id);
    if (!Number.isInteger(qid)) return res.status(400).json({ message: 'Invalid question ID' });
    const [rows] = await db.query(
      `SELECT a.AnswerID AS id,
              a.answer     AS answer,
              a.QuestionID AS question_id,
              a.author_id
       FROM Answers a
       WHERE a.QuestionID = ?
       ORDER BY a.AnswerID DESC`,
      [qid]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching answers by question:', err);
    res.status(500).json({ message: 'Error fetching answers' });
  }
});


app.post('/api/answers', authMiddleware, async (req, res) => {
  try {
    const { questionId, answer } = req.body || {};
    if (!questionId || !answer) {
      return res.status(400).json({ message: 'questionId and answer are required' });
    }
    const [result] = await db.query(
      'INSERT INTO Answers (answer, QuestionID, author_id) VALUES (?, ?, ?)',
      [answer, Number(questionId), req.user.id]
    );
    res.status(201).json({ id: result.insertId, answer, question_id: Number(questionId), author_id: req.user.id });
  } catch (err) {
    console.error('Create answer error:', err);
    res.status(500).json({ message: 'Create answer failed' });
  }
});


app.use((req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }
  res.status(404).send('Page not found');
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
