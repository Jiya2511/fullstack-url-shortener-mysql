// server/server.js

// --- 1. Imports and Setup ---
const express = require('express');
const cors = require('cors');
const pool = require('./db'); // Database connection pool (must be created)
const generateShortCode = require('./utils/shortCodeGenerator'); // Must be created

// Authentication and Security Imports
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth'); // NEW: Import the auth middleware

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json()); // Allows parsing of JSON request bodies


// --- 2. Authentication Routes (Registration and Login) ---

// Register User (Your provided code - No changes needed here)
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        // 1. Check if user already exists
        const [existingUsers] = await pool.execute('SELECT id FROM users WHERE username = ?', [username]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // 3. Save new user
        await pool.execute(
            'INSERT INTO users (username, password_hash) VALUES (?, ?)',
            [username, password_hash]
        );

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login User (Included for completeness)
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [users] = await pool.execute('SELECT id, password_hash FROM users WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const user = users[0];
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
// MODIFIED: Added 'auth' middleware and 'user_id' insertion
app.post('/api/shorten', auth, async (req, res) => { // ⬅️ Route is now protected
    const { longUrl } = req.body;
    const userId = req.user.id; // ⬅️ Get user ID from the token payload

    if (!longUrl) {
        return res.status(400).json({ message: 'URL is required.' });
    }

    try {
        const shortCode = generateShortCode();

        // SQL CHANGE: Inserting the user_id
        await pool.execute(
            'INSERT INTO links (short_code, long_url, user_id) VALUES (?, ?, ?)',
            [shortCode, longUrl, userId] // Pass the userId here
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
// MODIFIED: Added 'auth' middleware and 'user_id' filtering
app.get('/api/links', auth, async (req, res) => { // ⬅️ Route is now protected
    const userId = req.user.id; // ⬅️ Get user ID from the token payload

    try {
        // SQL CHANGE: Using WHERE clause to filter by user_id
        const [links] = await pool.execute(
            'SELECT short_code, long_url, click_count FROM links WHERE user_id = ? ORDER BY created_at DESC',
            [userId] // Pass the userId to the query
        );
        res.json(links);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching links.' });
    }
});


// --- 4. Redirect Route (Generic Endpoint - MUST BE LAST) ---

// 4.1. Redirect and Analytics Endpoint 
// This route remains public and does NOT use the 'auth' middleware
app.get('/:shortCode', async (req, res) => {
    const { shortCode } = req.params;

    try {
        // 1. Find the link
        const [links] = await pool.execute(
            'SELECT long_url FROM links WHERE short_code = ?',
            [shortCode]
        );

        if (links.length === 0) {
            return res.status(404).send('URL not found.');
        }

        const longUrl = links[0].long_url;

        // 2. Increment the click count (Analytics)
        await pool.execute(
            'UPDATE links SET click_count = click_count + 1 WHERE short_code = ?',
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