
const express = require('express');
const cors = require('cors');
const pool = require('./db'); 
const generateShortCode = require('./utils/shortCodeGenerator'); 


const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth'); 

require('dotenv').config();

const app = express();

app.use(cors({ origin: '*' })); 
app.use(express.json());




app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        
        const existingUsers = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
        
        
        if (existingUsers.rows.length > 0) { 
            return res.status(400).json({ message: 'User already exists' });
        }

    
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);


        await pool.query(
            'INSERT INTO users (username, password_hash) VALUES ($1, $2)',
            [username, password_hash]
        );

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error("Registration Crash:", error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});


app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const users = await pool.query('SELECT id, password_hash FROM users WHERE username = $1', [username]);
        
        if (users.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        
        const user = users.rows[0]; 
        
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
        console.error("Login Crash:", error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});



app.post('/api/shorten', auth, async (req, res) => { 
    const { longUrl } = req.body;
    const userId = req.user.id; 

    if (!longUrl) {
        return res.status(400).json({ message: 'URL is required.' });
    }

    try {
        const shortCode = generateShortCode();


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



app.get('/api/links', auth, async (req, res) => { 
    const userId = req.user.id; 

    try {

        const links = await pool.query(
            'SELECT short_code, long_url, click_count FROM links WHERE user_id = $1 ORDER BY created_at DESC',
            [userId] 
        );
        res.json(links.rows); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching links.' });
    }
});



app.get('/:shortCode', async (req, res) => {
    const { shortCode } = req.params;

    try {
       
        const links = await pool.query(
            'SELECT long_url FROM links WHERE short_code = $1',
            [shortCode]
        );

        if (links.rows.length === 0) {
            return res.status(404).send('URL not found.');
        }

        const longUrl = links.rows[0].long_url;

       
        await pool.query(
            'UPDATE links SET click_count = click_count + 1 WHERE short_code = $1',
            [shortCode]
        );

        
        res.redirect(longUrl);

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error during redirect.');
    }
});




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));