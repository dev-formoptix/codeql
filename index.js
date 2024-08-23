const express = require('express');
const bodyParser = require('body-parser');
const pgp = require('pg-promise')();
const multer = require('multer');
const path = require('path');
const { escape } = require('escape-html'); // import the escape-html function

// Database connection configuration
const db = pgp({
    host: 'localhost',
    port: 5432,
    database: 'your_database',
    user: 'your_user',
    password: 'your_password'
});

const app = express();
app.use(bodyParser.json());

// Route to create or alter a table in PostgreSQL
app.post('/alter-table', async (req, res) => {
    try {
        // Sample query to alter a table or create one if not exists
        const query = `
            DO $$
            BEGIN
                -- If the table does not exist, create it
                IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'sample_table') THEN
                    CREATE TABLE sample_table (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(100) NOT NULL,
                        age INT
                    );
                END IF;

                -- Alter table: add a new column if it does not exist
                IF NOT EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name = 'sample_table' AND column_name = 'address') THEN
                    ALTER TABLE sample_table ADD COLUMN address VARCHAR(255);
                END IF;
            END $$;
        `;

        // Execute the query
        await db.none(query);
        res.status(200).send('Table altered or created successfully');
    } catch (error) {
        console.error('Error altering table:', error);
        res.status(500).send('Error altering table');
    }
});

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Initialize multer with limits for file size (e.g., 100MB) and file filters
const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // Limit size to 100MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('file');

// Check file type (optional, e.g., restrict to certain file types)
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif|csv|txt|pdf/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Invalid file type!');
    }
}

// Route to upload a large file
app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.status(400).send(err);
        } else {
            if (req.file == undefined) {
                res.status(400).send('No file selected!');
            } else {
                res.send(`File uploaded: ${escape(req.file.filename)}`); // Sanitize the user-provided value
            }
        }
    });
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});