import { useState } from 'react';
import { useRouter } from 'next/router';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false); // ✅ خيار تذكرني
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!API_BASE) {
      setMessage('Error: API URL is not configured.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ إذا اختار "تذكرني" نخزن بالتخزين الدائم localStorage
        // ❌ إذا ما اختار، نخزن بالتخزين المؤقت sessionStorage
        const storage = rememberMe ? localStorage : sessionStorage;

        storage.setItem('access_token', data.access);
        storage.setItem('refresh_token', data.refresh);

      window.frames[0]?.postMessage(
        { access: data.access, refresh: data.refresh },
        "https://ai-news-generator-service.onrender.com"
          );

        setMessage('تم تسجيل الدخول بنجاح! جاري التحويل...');
        router.push('/dashboard');
      } else {
        setMessage(`خطأ: ${data.detail || 'بيانات الدخول غير صحيحة'}`);
      }
    } catch (error) {
      setMessage('حدث خطأ أثناء محاولة تسجيل الدخول.');
      console.error(error);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '400px', margin: '50px auto' }}>
      <h1>تسجيل الدخول</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="اسم المستخدم"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="كلمة المرور"
          required
        />

        {/* ✅ خيار تذكرني */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          تذكرني
        </label>

        <button type="submit">تسجيل الدخول</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
