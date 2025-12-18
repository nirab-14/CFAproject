import React, { useState } from 'react';
import './ChatLogin.css';
import axios from 'axios';

function ChatLogin({ onLogin, darkMode }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await axios.post(`${process.env.REACT_APP_API_URL}${endpoint}`, formData);

      if (response.data.token) {
        localStorage.setItem('customerToken', response.data.token);
        localStorage.setItem('customerData', JSON.stringify(response.data.user));
        onLogin(response.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`chat-login ${darkMode ? 'dark' : ''}`}>
      <div className="chat-login-header">
        <h3>{isLogin ? 'Welcome Back!' : 'Create Account'}</h3>
        <p>{isLogin ? 'Sign in to continue chatting' : 'Sign up to start chatting'}</p>
      </div>

      <form onSubmit={handleSubmit} className="chat-login-form">
        {!isLogin && (
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </div>
        )}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
        </button>
      </form>

      <div className="toggle-form">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <span onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Sign Up' : 'Sign In'}
        </span>
      </div>
    </div>
  );
}

export default ChatLogin;