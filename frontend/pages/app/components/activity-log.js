import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from './sidebar';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function ActivityLog() {
  const router = useRouter();
  const [activities, setActivities] = useState([]);
  const [user, setUser] = useState({ is_admin: false });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch(`${API_BASE}/api/users/me/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        setUser(data);
        if (!data.is_admin) router.push('/dashboard');
      })
      .catch(() => router.push('/dashboard'));

    fetch(`${API_BASE}/api/activity/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setActivities(data))
      .catch(err => console.error(err));
  }, [router]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar user={user} />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Activity Log</h1>
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4">User</th>
              <th className="py-2 px-4">Action</th>
              <th className="py-2 px-4">App</th>
              <th className="py-2 px-4">Time</th>
            </tr>
          </thead>
          <tbody>
            {activities.map(a => (
              <tr key={a.id} className="border-t">
                <td className="py-2 px-4">{a.user}</td>
                <td className="py-2 px-4">{a.action}</td>
                <td className="py-2 px-4">{a.app}</td>
                <td className="py-2 px-4">{new Date(a.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
