// client/src/Dashboard.js
import React, { useState, useEffect, useCallback } from 'react'; 
import axios from 'axios'; 
import './App.css'; 

// Define API constants (ensure these match your server location)
// --- Confirmed Live Render URL ---
const API_BASE = 'https://fullstack-url-shortener-mysql.onrender.com/api'; 
const REDIRECT_BASE = 'https://fullstack-url-shortener-mysql.onrender.com'; 

// This component receives 'token' and 'onLogout' from App.js
function Dashboard({ token, onLogout }) {
    // Initialize State Variables
    const [longUrl, setLongUrl] = useState('');
    const [shortLink, setShortLink] = useState('');
    const [links, setLinks] = useState([]); 
    const [message, setMessage] = useState('');
    
    // Memoize fetchLinks function using useCallback
    const fetchLinks = useCallback(async () => {
        try {
            // Sends the JWT token in the header for authentication
            const response = await axios.get(`${API_BASE}/links`, {
                headers: { 'x-auth-token': token } 
            }); 
            setLinks(response.data);
        } catch (err) {
            console.error("Failed to fetch links", err);
            // If the server returns 401 (Unauthorized), log the user out
            if (err.response && err.response.status === 401) {
                onLogout(); 
            }
        }
    }, [token, onLogout, setLinks]); 

    // Fetch links on component mount and whenever the token or fetchLinks function changes
    useEffect(() => {
        fetchLinks();
    }, [fetchLinks]); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setShortLink('');
        setMessage('');

        try {
            // Sends the JWT token for authentication
            const response = await axios.post(`${API_BASE}/shorten`, { longUrl }, {
                headers: { 'x-auth-token': token } 
            });
            setShortLink(`${REDIRECT_BASE}/${response.data.shortCode}`);
            setMessage('Success! Your link is shortened.');
            setLongUrl('');
            fetchLinks(); // Refresh the list
        } catch (err) {
            // Display specific error message from the server if available
            setMessage(err.response?.data?.message || 'Error shortening URL.');
        }
    };

    return (
        <div className="dashboard-content">
            {/* Shortening Form Section (Styled with card-box) */}
            <div className="card-box"> 
                <h2>Shorten a New Link</h2>
                <form onSubmit={handleSubmit} className="shorten-form-box">
                    <input
                        type="url"
                        value={longUrl}
                        onChange={(e) => setLongUrl(e.target.value)}
                        placeholder="Enter your long URL here (must include http/https)"
                        required
                    />
                    <button type="submit">Shorten</button>
                </form>

                {message && <p className="message">{message}</p>}
                {shortLink && (
                    <div className="result-box">
                        <p>Short URL:</p>
                        <a href={shortLink} target="_blank" rel="noopener noreferrer">{shortLink}</a>
                    </div>
                )}
            </div>

            {/* Link Table Section (Styled with card-box) */}
            <div className="card-box">
                <h2>My Links ({links.length})</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Short Code</th>
                            <th>Long URL</th>
                            <th>Clicks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {links.map((link) => (
                            <tr key={link.short_code}> 
                                <td><a href={`${REDIRECT_BASE}/${link.short_code}`} target="_blank" rel="noopener noreferrer">{link.short_code}</a></td>
                                <td>{link.long_url}</td>
                                <td>{link.click_count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Dashboard;