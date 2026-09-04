import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const API = axios.create({ baseURL: 'http://localhost:8080' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userProfile, setUserProfile] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin ? { email: formData.email, password: formData.password } : formData;

      const res = await API.post(endpoint, payload);
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setMessage({ text: 'Welcome to GovNext!', type: 'info' });
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Authentication Failed', type: 'error' });
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await API.get('/api/users/me');
      setUserProfile(res.data);
    } catch (err) {
      setMessage({ text: 'Access Denied', type: 'error' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUserProfile(null);
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="brand">GovNext AI</div>
        {token && <button className="btn-danger" onClick={handleLogout}>Logout</button>}
      </nav>

      <main className="main-content">
        {!token ? (
          <div className="auth-card">
            <h2 className="auth-title">GovNext Portal</h2>
            <p className="auth-subtitle">AI Job Eligibility & Portal</p>

            <div className="tab-group">
              <button className={`tab-btn ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>Login</button>
              <button className={`tab-btn ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>Register</button>
            </div>

            {message.text && (
              <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-info'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" name="name" className="form-control" onChange={handleChange} required />
                </div>
              )}
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" name="email" className="form-control" onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" className="form-control" onChange={handleChange} required />
              </div>
              <button type="submit" className="btn-primary">{isLogin ? 'Sign In' : 'Create Account'}</button>
            </form>
          </div>
        ) : (
          <div className="auth-card" style={{ maxWidth: '600px' }}>
            <h2>Dashboard</h2>
            <p className="auth-subtitle">Token Authenticated</p>
            <button className="btn-primary" onClick={fetchProfile} style={{ marginBottom: '1rem' }}>Fetch Profile Data</button>
            {userProfile && <pre style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '6px' }}>{JSON.stringify(userProfile, null, 2)}</pre>}
          </div>
        )}
      </main>
    </div>
  );
}
//sadoasjdopja