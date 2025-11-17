// server/db.js (FINAL POSTGRESQL VERSION)
const { Pool } = require('pg'); 
require('dotenv').config();

// Use DATABASE_URL for Render deployment, or local variables as a fallback
const connectionString = process.env.DATABASE_URL || 
                         `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:5432/${process.env.DB_NAME}`;

// Define the connection configuration object
const config = {
    connectionString: connectionString,
};

// CRUCIAL: If the app is running on a live platform (not localhost), enforce SSL
// Render provides the DATABASE_URL, which signifies a production environment.
if (process.env.DATABASE_URL) {
    config.ssl = {
        rejectUnauthorized: false // This bypasses strict certificate checking, often necessary on hosting platforms
    };
}

const pool = new Pool(config);

module.exports = pool;