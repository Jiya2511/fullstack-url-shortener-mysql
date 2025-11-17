// server/db.js (ULTIMATE FINAL POSTGRESQL VERSION)
const { Pool } = require('pg'); 
require('dotenv').config();

// Configuration relies entirely on the DATABASE_URL environment variable provided by Render.
const config = {
    connectionString: process.env.DATABASE_URL,
};

// CRUCIAL: Add SSL configuration only if a DATABASE_URL is present (i.e., deployed on Render)
if (process.env.DATABASE_URL) {
    config.ssl = {
        rejectUnauthorized: false // Necessary to bypass Render's custom certificate checks
    };
}

// NOTE: If DATABASE_URL is missing, this will fail immediately, preventing local fallback issues.
const pool = new Pool(config);

module.exports = pool;