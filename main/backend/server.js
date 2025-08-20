const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

const db = require('./db');


app.get('/', (req, res) => {
    res.send('Welcome to Project4 API!');
});


app.get('/categories', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Categories');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(404).send('Error fetching categories');
    }
});


app.get('/questions', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Questions');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching questions:', err);
        res.status(404).send('Error fetching questions');
    }
});

app.get('/answers', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Answers');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching answers:', err);
        res.status(404).send('Error fetching answers');
    }
});


app.post('/users', async (req, res) => {
    const { Username, Password } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO Users (Username, Password) VALUES (?, ?)',
            [Username, Password]
        );
        res.json({ message: 'User added successfully!', id: result.insertId });
    } catch (err) {
        console.error('Error inserting user:', err);
        res.status(404).send('Error inserting user');
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
