const express = require('express');
const { execFileSync } = require('child_process');
const mysql = require('mysql');
const rateLimit = require('express-rate-limit');
const app = express();
const port = 3000;
const shellQuote = require('shell-quote');

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
  const query = `SELECT * FROM users WHERE id = ?`;

  connection.query(query, [userId], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

// Command Injection vulnerability (Alert 2)
app.get('/exec', (req, res) => {
  const cmd = req.query.command;
  const args = shellQuote.parse(cmd);

  const safeArgs = args.map(arg => (typeof arg === "string" ? arg.replace(/(["\s'$`\\])/g,'\\$1') : arg));
  
  execFileSync(safeArgs[0], safeArgs.slice(1));

  res.send("Command executed successfully.");
});

// Server-side URL redirect vulnerability (Alert 3)
app.get('/redirect', (req, res) => {
  const target = req.query.url;
  // Validate the target URL against a list of authorized redirects
  const authorizedRedirects = ["/homepage", "/about", "/contact"];
  if (isAuthorizedRedirect(target, authorizedRedirects)) {
    res.redirect(target);
  } else {
    res.redirect("/"); // Redirect to a default page if the target is not authorized
  }
});

// Function to validate the target URL
function isAuthorizedRedirect(url, authorizedRedirects) {
  // Check if the target URL is in the list of authorized redirects
  return authorizedRedirects.includes(url);
}

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});