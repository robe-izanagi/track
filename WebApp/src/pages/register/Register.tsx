import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  // const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountCode1, setAccountCode1] = useState('');
  const [accountCode2, setAccountCode2] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      await axios.post(`${API_BASE}/auth/register`, {
        username, 
        // email,
        password,
        accountCode1,
        accountCode2
      });
      setLoading(false);
      alert('Registered successfully! Now login.');
      window.location.href = '/login';
    } catch (err: any) {
      setLoading(false);
      const serverMsg =
        err?.response?.data?.msg ||
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Registration failed';
      setMsg(String(serverMsg));
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: 480, margin: '0 auto' }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ display: 'block', margin: '10px 0', width: '100%' }}
        />
        {/* <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ display: 'block', margin: '10px 0', width: '100%' }}
        /> */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ display: 'block', margin: '10px 0', width: '100%' }}
        />
        <input
          type="text"
          placeholder="Account Code 1"
          value={accountCode1}
          onChange={(e) => setAccountCode1(e.target.value)}
          required
          style={{ display: 'block', margin: '10px 0', width: '100%' }}
        />
        <input
          type="text"
          placeholder="Account Code 2"
          value={accountCode2}
          onChange={(e) => setAccountCode2(e.target.value)}
          required
          style={{ display: 'block', margin: '10px 0', width: '100%' }}
        />
        <button type="submit" disabled={loading} style={{ marginTop: 10 }}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      {msg && (
        <div style={{ marginTop: 12, color: 'crimson' }}>
          <strong>{msg}</strong>
        </div>
      )}

      <p style={{ marginTop: 12 }}>
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
};

export default Register;
