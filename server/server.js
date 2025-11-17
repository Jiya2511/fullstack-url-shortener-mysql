// server/server.js

// --- 1. Imports and Setup ---
const express = require('express');
const cors = require('cors');
// NOTE: 'pool' now uses the 'pg' driver instead of 'mysql2'
const pool = require('./db'); 
const generateShortCode = require('./utils/shortCodeGenerator'); 

// Authentication and Security Imports
// TO THIS:
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth'); 

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json()); // Allows parsing of JSON request bodies


// --- 2. Authentication Routes (Registration and Login) ---

// Register User
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        // 1. Check if user already exists (PostgreSQL syntax: $1)
        const existingUsers = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
        if (existingUsers.rows.length > 0) { // NOTE: pg returns result in rows property
            return res.status(400).json({ message: 'User already exists' });
        }

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // 3. Save new user (PostgreSQL syntax: $1, $2)
        await pool.query(
            'INSERT INTO users (username, password_hash) VALUES ($1, $2)',
            [username, password_hash]
        );

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login User
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Find user (PostgreSQL syntax: $1)
        const users = await pool.query('SELECT id, password_hash FROM users WHERE username = $1', [username]);
        if (users.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const user = users.rows[0]; // NOTE: Access data via .rows[0]
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const payload = { user: { id: user.id } };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
});


// --- 3. Core API Routes (Protected and Personalized Endpoints) ---

// 3.1. Shorten Link Endpoint 
app.post('/api/shorten', auth, async (req, res) => { 
    const { longUrl } = req.body;
    const userId = req.user.id; 

    if (!longUrl) {
        return res.status(400).json({ message: 'URL is required.' });
    }

    try {
        const shortCode = generateShortCode();

        // SQL CHANGE: Inserting the user_id (PostgreSQL syntax: $1, $2, $3)
        await pool.query(
            'INSERT INTO links (short_code, long_url, user_id) VALUES ($1, $2, $3)',
            [shortCode, longUrl, userId] 
        );

        res.status(201).json({ 
            shortCode: shortCode, 
            shortUrl: `${req.protocol}://${req.get('host')}/${shortCode}` 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error shortening URL.' });
    }
});


// 3.2. Get All Links Endpoint (Dashboard Data)
app.get('/api/links', auth, async (req, res) => { 
    const userId = req.user.id; 

    try {
        // SQL CHANGE: Using WHERE clause to filter by user_id (PostgreSQL syntax: $1)
        const links = await pool.query(
            'SELECT short_code, long_url, click_count FROM links WHERE user_id = $1 ORDER BY created_at DESC',
            [userId] 
        );
        res.json(links.rows); // NOTE: Return data via .rows
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching links.' });
    }
});


// --- 4. Redirect Route (Generic Endpoint - MUST BE LAST) ---

// 4.1. Redirect and Analytics Endpoint 
app.get('/:shortCode', async (req, res) => {
    const { shortCode } = req.params;

    try {
        // 1. Find the link (PostgreSQL syntax: $1)
        const links = await pool.query(
            'SELECT long_url FROM links WHERE short_code = $1',
            [shortCode]
        );

        if (links.rows.length === 0) {
            return res.status(404).send('URL not found.');
        }

        const longUrl = links.rows[0].long_url;

        // 2. Increment the click count (Analytics - PostgreSQL syntax: $1)
        await pool.query(
            'UPDATE links SET click_count = click_count + 1 WHERE short_code = $1',
            [shortCode]
        );

        // 3. Redirect the user
        res.redirect(longUrl);

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error during redirect.');
    }
});


// --- 5. Start Server ---

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));