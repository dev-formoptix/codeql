const express = require('express');
const { exec } = require('child_process');
const mysql = require('mysql');
const app = express();
const port = 3000;
const RateLimit = require('express-rate-limit');

// Sample MySQL connection setup
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'test_db'
});

connection.connect();

// SQL Injection vulnerability (Alert 1)
app.get('/users/:id', (req, res) => {
    const userId = req.params.id;
    const query = `SELECT * FROM users WHERE id = ${userId}`;
    
    connection.query(query, (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});

// Command Injection vulnerability (Alert 2)
app.get('/exec', (req, res) => {
    const cmd = req.query.command;
    
    exec(cmd, (err, stdout, stderr) => {
        if (err) {
            res.send(`Error: ${stderr}`);
            return;
        }
        res.send(`Output: ${stdout}`);
    });
});

// Unvalidated redirect (Alert 3)
app.get('/redirect', (req, res) => {
    const target = req.query.url;
    res.redirect(target);
});

// Rate limiting middleware
const limiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per windowMs
});

// Apply rate limiter to all requests
app.use(limiter);

app.listen(port, () => {
    console.log(`App running on port ${port}`);
});