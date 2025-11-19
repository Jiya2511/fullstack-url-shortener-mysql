
import React, { useState, useEffect } from 'react';
import Auth from './Auth'; 
import Dashboard from './Dashboard'; 
import './App.css'; 

function App() {
    
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [view, setView] = useState(token ? 'dashboard' : 'login'); 

    const handleLogin = (jwtToken) => {
        localStorage.setItem('token', jwtToken);
        setToken(jwtToken);
        setView('dashboard');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setView('login');
    };

    const renderContent = () => {
        if (token) {
            return <Dashboard token={token} onLogout={handleLogout} />;
        }

        return (
            <Auth 
                view={view} 
                setView={setView} 
                onLogin={handleLogin} 
            />
        );
    };

    return (
        <div className="App-container">
            <header>
                <h1>🔗 Personalized URL Shortener</h1>
                {token && <button onClick={handleLogout} className="logout-button">Logout</button>}
            </header>
            <main>
                {renderContent()}
            </main>
        </div>
    );
}

export default App;