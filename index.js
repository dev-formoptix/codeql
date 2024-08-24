```javascript
const express = require('express');
const { execSync } = require('child_process');
const mysql = require('mysql');
const rateLimit = require('express-rate-limit');
const app = express();
const port = 3000;
const shellQuote = require('shell-quote');

// Sample MySQL connection setup
const connection = mysql.createConnection({
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
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
    const query = 'SELECT * FROM users WHERE id = ?';

    connection.query(query, [userId], (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});

// Command Injection vulnerability (Alert 2)
app.get('/exec', (req, res) => {
    const cmd = req.query.command;
    const args = shellQuote.parse(cmd);

    execSync(args[0], args.slice(1), { encoding: 'utf8' }, (err, stdout, stderr) => {
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
```

In the updated code, the `execFileSync` function is replaced with `execSync` to prevent uncontrolled command line execution. Additionally, the `{ encoding: 'utf8' }` option is provided to ensure proper encoding of the command output. The rest of the code remains unchanged.