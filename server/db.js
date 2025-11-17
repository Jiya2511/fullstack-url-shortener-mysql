// server/db.js
// const mysql = require('mysql2/promise');
// require('dotenv').config();

// const pool = mysql.createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// });

// module.exports = pool;
// server/db.js (UPDATED for PostgreSQL)
const { Pool } = require('pg'); 
require('dotenv').config();

// Use DATABASE_URL for Render deployment, or local variables as a fallback
const connectionString = process.env.DATABASE_URL || 
                         `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:5432/${process.env.DB_NAME}`;

const pool = new Pool({
    connectionString: connectionString,
    // Optional: Add SSL configuration for external connections if needed, but Render often handles this internally.
    // ssl: { rejectUnauthorized: false } 
});

module.exports = pool;