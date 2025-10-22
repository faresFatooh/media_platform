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

    if (role === 'admin' && adminSecret !== SECRET_KEY) {
      setMessage('❌ Invalid admin secret key.');
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
          role
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('user_role', data.role);

        setMessage(`✅ ${data.message}`);
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        const errorText = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join(', ');
        setMessage(`❌ ${errorText}`);
      }
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: '450px', margin: '50px auto', padding: '2rem', borderRadius: '12px', backgroundColor: '#f4f6f8' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Register New User</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <input type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required />
        <input type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required />
        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        {role === 'admin' && <input type="password" placeholder="Admin Secret Key" value={adminSecret} onChange={e => setAdminSecret(e.target.value)} />}
        <button type="submit">Register</button>
      </form>
      {message && <p style={{ color: message.startsWith('✅') ? 'green' : 'red' }}>{message}</p>}
    </div>
  );
}
