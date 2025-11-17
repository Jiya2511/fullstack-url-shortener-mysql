// client/src/Auth.js
import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = 'https://fullstack-url-shortener-mysql.onrender.com/api'; 
const REDIRECT_BASE = 'https://fullstack-url-shortener-mysql.onrender.com';

function Auth({ view, setView, onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleAuth = async (e, endpoint) => {
        e.preventDefault();
        setMessage('');

        try {
            const response = await axios.post(`${API_BASE}/${endpoint}`, { username, password });
            
            if (endpoint === 'login') {
                onLogin(response.data.token); 
            } else { // Register
                setMessage('Registration successful! Please log in.');
                setView('login');
            }
        } catch (err) {
            setMessage(err.response?.data?.message || `Error during ${endpoint}`);
        }
    };

    const isLogin = view === 'login';

    return (
        <div className="auth-container card-box"> 
            <h2>{isLogin ? 'Log In' : 'Register'}</h2>
            
            <form onSubmit={(e) => handleAuth(e, isLogin ? 'login' : 'register')}>
                <input 
                    type="text" 
                    placeholder="Username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                />
                <button type="submit">{isLogin ? 'Log In' : 'Register'}</button>
            </form>
            
            {message && <p className="auth-message">{message}</p>}
            
            <p className="toggle-view" onClick={() => setView(isLogin ? 'register' : 'login')}>
                {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
            </p>
        </div>
    );
}

export default Auth;