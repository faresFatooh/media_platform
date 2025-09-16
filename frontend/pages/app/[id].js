import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AppDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [app, setApp] = useState(null);
  const [error, setError] = useState('');


  const services = {
    '1': { url: 'http://localhost:3002', name: 'تطبيق الأخبار وتحريرها' },
    '2': { url: 'http://localhost:3001', name: 'مزامنة الفيديو والترجمة' },
    '3': { url: 'http://localhost:3003', name: 'مولد الأفاتار الديناميكي' },
    '4': { url: 'https://chatbot-service-jjas.onrender.com', name: 'بوت النجاح الإخباري' },
    '5': { url: 'https://news-refine-service.onrender.com', name: 'أتمتة أخبار الشرق' },
    '6': { url: 'https://podcast-service.onrender.com', name: 'مساعد أتمتة البودكاست' },
    '7': { url: 'https://style-editor-service.onrender.com', name: 'محرر-الأسلوب-الشخصي' },
    '8': { url: 'http://localhost:3008', name: 'مُحَوِّل-النصوص-إلى-انفوجرافيك' },
  };

  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

  
    const appDetails = services[id];
    if (appDetails) {
        setApp(appDetails);
    } else {
        setError('Application not found or configured.');
    }

  }, [id]);

  if (error) return <p>Error: {error}</p>;
  if (!app) return <p>Loading application...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header style={{ padding: '1rem 2rem', backgroundColor: '#1a1a1a', color: 'white', flexShrink: 0 }}>
        <Link href="/dashboard" style={{ color: 'white' }}>&larr; Back to Dashboard</Link>
        <h1 style={{ marginTop: '0.5rem' }}>{app.name}</h1>
      </header>

      <main style={{ flexGrow: 1, padding: 0 }}>
        {}
        <iframe
          src={app.url}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title={app.name}
        />
      </main>
    </div>
  );
}