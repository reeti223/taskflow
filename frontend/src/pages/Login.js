import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await login(form);
      loginUser(res.data.access_token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo">✅</div>
        <h1>Welcome back</h1>
        <p>Sign in to your Team Task Manager</p>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="auth-link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
