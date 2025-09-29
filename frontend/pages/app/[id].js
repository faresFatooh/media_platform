import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react'; 
import Link from 'next/link';

export default function AppDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [app, setApp] = useState(null);
  const [error, setError] = useState('');
  const iframeRef = useRef(null); 



  const services = {
    '1': { url: 'https://ai-news-generator-service.onrender.com', name:'مولد-المقالات-بالذكاء-الاصطناعي' },
    '2': { url: 'https://ai-news-app-lpgh.onrender.com', name:'مولد-الأخبار-بالذكاء-الاصطناعي' },
    '3': { url: 'https://infographic-converter.onrender.com', name:'مُحَوِّل-النصوص-إلى-انفوجرافيك' },
    '4': { url: 'https://pal-content-generator.onrender.com', name:'تطبيق مولد الاخبار الفلسطينية' },
    '5': { url: 'https://youtube-documentary-script-generator.onrender.com', name:'تطبيق مولد اليوتيوب ' },
    '6': { url: 'https://ai-news-content-generator.onrender.com', name:'مولد المحتوى الاخباري' },


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
  }, [id, router]);

  // --- دالة جديدة لإرسال التوكن ---
  const handleIframeLoad = () => {
    const token = localStorage.getItem('access_token');
    if (iframeRef.current && token && app) {
      // نرسل رسالة تحتوي على التوكن إلى الإطار
      iframeRef.current.contentWindow.postMessage({
        type: 'AUTH_TOKEN',
        token: token
      }, new URL(app.url).origin); // نحدد المصدر لزيادة الأمان
    }
  };

  if (error) return <p>Error: {error}</p>;
  if (!app) return <p>Loading application...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header style={{ padding: '1rem 2rem', backgroundColor: '#1a1a1a', color: 'white', flexShrink: 0 }}>
        <Link href="/dashboard" style={{ color: 'white' }}>&larr; Back to Dashboard</Link>
        <h1 style={{ marginTop: '0.5rem' }}>{app.name}</h1>
      </header>
      
      <main style={{ flexGrow: 1, padding: 0 }}>
        <iframe
          ref={iframeRef} // <-- ربطنا المرجع هنا
          onLoad={handleIframeLoad} // <-- سنقوم بتشغيل الدالة عند اكتمال التحميل
          src={app.url}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title={app.name}
        />
      </main>
    </div>
  );
}