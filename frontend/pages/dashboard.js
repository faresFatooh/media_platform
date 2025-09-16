import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function Dashboard() {
  const router = useRouter();
  const [apps, setApps] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchApplications = async () => {
      if (!API_BASE) {
        setError('API URL is not configured. Please check environment variables.');
        return;
      }
      try {
        const response = await fetch(`${API_BASE}/api/applications/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Could not fetch applications. Please log in again.');
        }

        const data = await response.json();

        if (Array.isArray(data)) {
            setApps(data);
        } else {
            console.error("Data received is not an array:", data);
            setError('Received invalid data format from server.');
        }

      } catch (err) {
        setError(err.message);
      }
    };

    fetchApplications();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.push('/login');
  };

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', backgroundColor: '#1a1a1a', color: 'white' }}>
        <h1>Main Dashboard</h1>
        <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Logout</button>
      </header>

      <main style={{ padding: '2rem' }}>
        <h2>Available Applications</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {Array.isArray(apps) && apps.map((app) => (
            <div key={app.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ marginTop: 0 }}>{app.name}</h3>
                <p>{app.description}</p>
              </div>
              <Link href={`/app/${app.id}`}>
                <button style={{ width: '100%', padding: '0.75rem', cursor: 'pointer', marginTop: '1rem' }}>Launch App</button>
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

