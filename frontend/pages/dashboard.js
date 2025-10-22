import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const router = useRouter();
  const [role, setRole] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    const userRole = localStorage.getItem('user_role');

    if (!accessToken) {
      router.push('/login');
      return;
    }

    setRole(userRole || 'user');

    // جلب اسم المستخدم من التوكن أو من API (اختياري)
    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me/`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const data = await res.json();
        if (res.ok) setUsername(data.username);
      } catch (err) {
        console.error('Failed to fetch user info', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    router.push('/login');
  };

  if (loading) {
    return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</p>;
  }

  return (
    <div style={{
      fontFamily: 'Inter, sans-serif',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1f2937' }}>
            Welcome, {username || 'User'}
          </h1>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#ef4444',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = '#dc2626'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = '#ef4444'}
          >
            Logout
          </button>
        </div>

        <hr style={{ margin: '1.5rem 0', borderColor: '#e5e7eb' }} />

        {role === 'admin' ? (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>Admin Panel</h2>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>You have full access to manage users and settings.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: '#f3f4f6', textAlign: 'center' }}>Manage Users</div>
              <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: '#f3f4f6', textAlign: 'center' }}>Settings</div>
            </div>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>User Dashboard</h2>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>You can view your profile, settings, and activities.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: '#f3f4f6', textAlign: 'center' }}>Profile</div>
              <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: '#f3f4f6', textAlign: 'center' }}>Settings</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
