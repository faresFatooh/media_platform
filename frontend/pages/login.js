import { useState } from 'react';
import { useRouter } from 'next/router';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    console.log("[Login] Submitting:", { username, password });

    try {
      const response = await fetch(`${API_BASE}/api/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server response is not valid JSON:\n${text}`);
      }

      console.log("[Login] Server response:", data);

      if (response.ok) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);

        // تحديد الدور بناءً على is_superuser و is_staff
        const role = (data.is_superuser && data.is_staff) ? 'admin' : 'user';
        localStorage.setItem('user_role', role);
        console.log("[Login] User role saved to localStorage:", role);

        setMessage('✅ Login successful! Redirecting...');
        router.push('/dashboard');
      } else {
        setMessage(`❌ ${data.detail || 'Invalid credentials'}`);
      }
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div style={{
      fontFamily: 'Inter, sans-serif',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #3b82f6, #6366f1)'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '3rem 2rem',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        <h1 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: '700', color: '#1f2937' }}>Welcome Back</h1>
        <p style={{ textAlign: 'center', color: '#6b7280' }}>Login to your account</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
            style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem' }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem' }}
          />
          <button
            type="submit"
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#3b82f6',
              color: 'white',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            Login
          </button>
        </form>

        {message && (
          <p style={{ textAlign: 'center', color: message.startsWith('❌') ? '#ef4444' : '#10b981', fontWeight: '500' }}>
            {message}
          </p>
        )}

        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>
          Don't have an account? <a href="/register" style={{ color: '#3b82f6', fontWeight: '500' }}>Sign Up</a>
        </p>
      </div>
    </div>
  );
}
