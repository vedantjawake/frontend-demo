import React, { useState } from 'react';
import axios from 'axios';

// Backend Base URL
const API = axios.create({
  baseURL: 'http://localhost:8080',
});

// Automatic Bearer Token Header Injector
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userProfile, setUserProfile] = useState(null);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. Submit Auth (Login / Register)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const res = await API.post(endpoint, payload);
      
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setMessage(`${isLogin ? 'Login' : 'Registration'} Successful!`);
      }
    } catch (err) {
      setMessage(`Error: ${err.response?.data?.message || err.message}`);
    }
  };

  // 2. Fetch Protected Profile Data
  const fetchProfile = async () => {
    setMessage('');
    try {
      const res = await API.get('/api/users/me');
      setUserProfile(res.data);
    } catch (err) {
      setMessage(`Protected API Error: ${err.response?.statusText || err.message}`);
    }
  };

  // 3. Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUserProfile(null);
    setMessage('Logged out successfully.');
  };

  return (
    <div style={{ maxWidth: '420px', margin: '40px auto', fontFamily: 'Arial, sans-serif', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
      <h2 style={{ textAlign: 'center', margin: '0 0 20px 0' }}>GovNext API Tester</h2>
      
      {message && (
        <div style={{ padding: '10px', background: '#f8f9fa', borderLeft: '4px solid #007bff', marginBottom: '15px', fontSize: '14px' }}>
          {message}
        </div>
      )}

      {!token ? (
        <div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button 
              onClick={() => setIsLogin(true)} 
              style={{ flex: 1, padding: '8px', fontWeight: isLogin ? 'bold' : 'normal', cursor: 'pointer' }}
            >
              Login
            </button>
            <button 
              onClick={() => setIsLogin(false)} 
              style={{ flex: 1, padding: '8px', fontWeight: !isLogin ? 'bold' : 'normal', cursor: 'pointer' }}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
              </div>
            )}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              {isLogin ? 'Login' : 'Register'}
            </button>
          </form>
        </div>
      ) : (
        <div>
          <p style={{ color: 'green', fontWeight: 'bold' }}>✓ Bearer Token Active</p>
          <div style={{ wordBreak: 'break-all', fontSize: '11px', background: '#eee', padding: '8px', borderRadius: '4px', marginBottom: '15px' }}>
            {token}
          </div>

          <button onClick={fetchProfile} style={{ width: '100%', padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', marginBottom: '10px', cursor: 'pointer' }}>
            Test Protected API (/api/users/me)
          </button>
          
          <button onClick={handleLogout} style={{ width: '100%', padding: '10px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Logout
          </button>

          {userProfile && (
            <pre style={{ background: '#eef', padding: '10px', borderRadius: '4px', marginTop: '15px', overflowX: 'auto', fontSize: '12px' }}>
              {JSON.stringify(userProfile, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}