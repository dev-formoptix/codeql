const express = require('express');
const { execFileSync } = require('child_process');
const mysql = require('mysql');
const rateLimit = require('express-rate-limit');
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

// Create rate limiter middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per windowMs
});

// Apply rate limiter middleware to all requests
app.use(limiter);

// SQL Injection vulnerability (Alert 1)
app.get('/users/:id', (req, res) => {
    const userId = req.params.id;
    const query = `SELECT * FROM users WHERE id = ?`; // Changed to use query parameters

    connection.query(query, [userId], (err, results) => { // Using query parameters
        if (err) throw err;
        res.send(results);
    });
});

// Command Injection vulnerability (Alert 2)
app.get('/exec', (req, res) => {
    const cmd = req.query.command;
    const args = cmd.split(' ');

    execFileSync('wc', args); // Changed to use execFileSync

    res.send(`Output: ${stdout}`);
});

// Unvalidated redirect (Alert 3)
app.get('/redirect', (req, res) => {
    const target = req.query.url;
    // Validate the target URL against a list of authorized redirects
    const authorizedRedirects = ["/homepage", "/about", "/contact"];
    if (authorizedRedirects.includes(target)) {
        res.redirect(target);
    } else {
        res.redirect("/"); // Redirect to a default page if the target is not authorized
    }
});

app.listen(port, () => {
    console.log(`App running on port ${port}`);
});