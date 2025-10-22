import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Dummy data
const dummyActivities = [
  { id: 1, user: 'Ali', action: 'Generated Article', time: '2 mins ago' },
  { id: 2, user: 'Sara', action: 'Published News', time: '10 mins ago' },
  { id: 3, user: 'Admin', action: 'Edited Infographic', time: '1 hour ago' },
];

const dummyTasks = [
  { id: 1, user: 'Ali', task: 'Write news on Gaza', status: 'In Progress' },
  { id: 2, user: 'Sara', task: 'Generate Infographic', status: 'Pending' },
  { id: 3, user: 'Ali', task: 'Publish Article', status: 'Completed' },
  { id: 4, user: 'Sara', task: 'Edit Video', status: 'In Progress' },
];

export default function Dashboard() {
  const router = useRouter();
  const [apps, setApps] = useState([]);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Filters
  const [taskFilterUser, setTaskFilterUser] = useState('All');
  const [taskFilterStatus, setTaskFilterStatus] = useState('All');
  const [taskSearch, setTaskSearch] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const role = localStorage.getItem('user_role') || 'user';
    setIsAdmin(role === 'admin');

    const fetchApplications = async () => {
      if (!API_BASE) {
        setError('API URL is not configured.');
        return;
      }
      try {
        const response = await fetch(`${API_BASE}/api/applications/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Could not fetch applications. Please log in again.');
        const data = await response.json();
        if (Array.isArray(data)) setApps(data);
        else setError('Invalid data format from server.');
      } catch (err) {
        setError(err.message);
      }
    };

    fetchApplications();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    router.push('/login');
  };

  const handleTaskStatusChange = (taskId, newStatus) => {
    const updatedTasks = dummyTasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
    console.log('Updated Tasks:', updatedTasks);
    alert(`Task ${taskId} status updated to ${newStatus}`);
  };

  const filteredTasks = dummyTasks.filter(task => {
    const matchesUser = taskFilterUser === 'All' || task.user === taskFilterUser;
    const matchesStatus = taskFilterStatus === 'All' || task.status === taskFilterStatus;
    const matchesSearch = task.task.toLowerCase().includes(taskSearch.toLowerCase());
    return matchesUser && matchesStatus && matchesSearch;
  });

  const allUsers = Array.from(new Set(dummyTasks.map(t => t.user)));

  return (
    <div style={{ display: 'flex', fontFamily: 'Inter, sans-serif', minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
      
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '2rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem' }}>Media Platform</h1>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link href="/dashboard">
              <div style={{ color: 'white', fontWeight: '500', padding: '0.5rem', borderRadius: '6px', transition: '0.2s' }}
                 onMouseOver={e => e.currentTarget.style.backgroundColor = '#374151'}
                 onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                Dashboard
              </div>
            </Link>
            <Link href="/dashboard/profile">
              <div style={{ color: 'white', fontWeight: '500', padding: '0.5rem', borderRadius: '6px', transition: '0.2s' }}
                 onMouseOver={e => e.currentTarget.style.backgroundColor = '#374151'}
                 onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                Profile
              </div>
            </Link>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: '#ef4444',
            color: 'white',
            fontWeight: '600',
            transition: '0.3s',
          }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = '#dc2626'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = '#ef4444'}
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem 3rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#111827' }}>Available Applications</h2>
        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

        {/* App Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {Array.isArray(apps) && apps.map((app) => (
            <div key={app.id} style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              transition: 'transform 0.3s, box-shadow 0.3s',
              cursor: 'pointer'
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
            }}
            >
              <div>
                <h3 style={{ marginTop: 0, fontSize: '1.2rem', fontWeight: '600', color: '#1f2937' }}>{app.name}</h3>
                <p style={{ color: '#4b5563', marginTop: '0.5rem' }}>{app.description}</p>
              </div>
              <Link href={`/app/${app.id}`}>
                <button style={{
                  width: '100%',
                  padding: '0.7rem 1rem',
                  marginTop: '1.5rem',
                  borderRadius: '8px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  fontWeight: '600',
                  border: 'none',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#2563eb'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = '#3b82f6'}
                >
                  Launch App
                </button>
              </Link>
            </div>
          ))}
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <section style={{ marginTop: '3rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#111827' }}>Employee Activity & Tasks</h2>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search Task..."
                value={taskSearch}
                onChange={e => setTaskSearch(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', flex: 1 }}
              />
              <select value={taskFilterUser} onChange={e => setTaskFilterUser(e.target.value)} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                <option>All</option>
                {allUsers.map(user => <option key={user}>{user}</option>)}
              </select>
              <select value={taskFilterStatus} onChange={e => setTaskFilterStatus(e.target.value)} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                <option>All</option>
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>

            {/* Activity Log */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
              <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Activity Log</h3>
              {dummyActivities.map(activity => (
                <div key={activity.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', color: '#374151' }}>
                  <span><strong>{activity.user}</strong> {activity.action}</span>
                  <span style={{ color: '#9ca3af' }}>{activity.time}</span>
                </div>
              ))}
            </div>

            {/* Task Manager */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Task Manager</h3>
              {filteredTasks.map(task => (
                <div key={task.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#374151' }}>
                  <span><strong>{task.user}</strong>: {task.task}</span>
                  <div>
                    <select
                      value={task.status}
                      onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                      style={{ padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                    >
                      <option>Pending</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}