// server/utils/shortCodeGenerator.js
function generateShortCode() {
    // Generates a 6-character alphanumeric code
    return Math.random().toString(36).substring(2, 8);
}
module.exports = generateShortCode;