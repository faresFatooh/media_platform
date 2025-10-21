import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Sidebar from './app/components/sidebar';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function Dashboard() {
  const router = useRouter();
  const [apps, setApps] = useState([]);
  const [error, setError] = useState('');
  const [user, setUser] = useState({ is_admin: false });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch(`${API_BASE}/api/users/me/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(err => console.error(err));

    fetch(`${API_BASE}/api/applications/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setApps(data);
      })
      .catch(err => setError(err.message));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar user={user} />
      <main className="flex-1 p-6">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
        </header>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map(app => (
            <div key={app.id} className="bg-white rounded shadow p-4 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold">{app.name}</h3>
                <p>{app.description}</p>
              </div>
              <Link href={`/app/${app.id}`}>
                <button className="mt-4 bg-blue-500 text-white py-2 rounded w-full">Launch App</button>
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
