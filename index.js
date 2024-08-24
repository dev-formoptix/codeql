const express = require('express');
const { exec } = require('child_process');
const mysql = require('mysql');
const app = express();
const port = 3000;

// Sample MySQL connection setup
const connection = mysql.createConnection({
    host: 'localhost',
    user: process.env.USERNAME, // Using environment variable instead of hard-coded value
    password: process.env.PASSWORD, // Using environment variable instead of hard-coded value
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

app.listen(port, () => {
    console.log(`App running on port ${port}`);
});