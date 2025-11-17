const pool = require('./db'); 

async function testConnection() {
    try {
        const [rows] = await pool.execute('SELECT 1 + 1 AS solution');
        console.log('✅ Database connection successful! Solution:', rows[0].solution);
        process.exit(0);
    } catch (error) {
        console.error('❌ Database connection failed! Error:', error.message);
        process.exit(1);
    }
}
testConnection();