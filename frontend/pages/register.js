import { useState } from 'react';
import { useRouter } from 'next/router';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export default function Register() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('user');
  const [adminSecret, setAdminSecret] = useState('');
  const [message, setMessage] = useState('');

  const SECRET_KEY = process.env.NEXT_PUBLIC_REGISTER_SECRET || 'root';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // تحقق من كلمة السر للادمن قبل التسجيل
    if (role === 'admin' && adminSecret !== SECRET_KEY) {
      setMessage('Error: Invalid admin secret key.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/users/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          role // إرسال الدور إلى الباكند
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.message}`);
        // إعادة توجيه تلقائي بعد 2 ثانية
        setTimeout(() => router.push('/login'), 2000);
      } else {
        const errorText = Object.entries(data).map(([key, value]) => `${key}: ${value}`).join(', ');
        setMessage(`❌ ${errorText}`);
      }
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: '450px', margin: '50px auto', backgroundColor: '#f4f6f8', padding: '2rem', borderRadius: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#111827' }}>Register New User</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required
          style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required
          style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required
          style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
        <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" required
          style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
        <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" required
          style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />

        {/* اختيار الدور */}
        <select value={role} onChange={(e) => setRole(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #d1d5db' }}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        {/* خانة سرية للادمن */}
        {role === 'admin' && (
          <input type="password" value={adminSecret} onChange={(e) => setAdminSecret(e.target.value)} placeholder="Admin Secret Key"
            style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
        )}

        <button type="submit" style={{
          padding: '0.75rem',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: '#3b82f6',
          color: 'white',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'background-color 0.3s'
        }}
        onMouseOver={e => e.currentTarget.style.backgroundColor = '#2563eb'}
        onMouseOut={e => e.currentTarget.style.backgroundColor = '#3b82f6'}
        >
          Register
        </button>
      </form>
      {message && <p style={{ marginTop: '1rem', color: message.startsWith('✅') ? 'green' : 'red' }}>{message}</p>}
    </div>
  );
}
