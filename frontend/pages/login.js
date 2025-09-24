import { useState } from 'react';
import { useRouter } from 'next/router';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    if (!API_BASE) {
      setMessage('❌ خطأ: لم يتم ضبط رابط الـ API.');
      setLoading(false);
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
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        setMessage('✅ تم تسجيل الدخول بنجاح! جاري التحويل...');
        setTimeout(() => router.push('/dashboard'), 1200);
      } else {
        setMessage(`❌ خطأ: ${data.detail || 'بيانات الدخول غير صحيحة'}`);
      }
    } catch (err) {
      setMessage('⚠️ حدث خطأ في الاتصال بالخادم. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '400px', margin: '50px auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>تسجيل الدخول</h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
      >
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="اسم المستخدم"
          required
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="كلمة المرور"
          required
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#06b6d4',
            color: 'white',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '⏳ جاري تسجيل الدخول...' : '🚀 تسجيل الدخول'}
        </button>
      </form>

      {message && (
        <div style={{ marginTop: '15px', textAlign: 'center', color: message.includes('✅') ? 'green' : 'red' }}>
          <p>{message}</p>
          {message.startsWith('❌') || message.startsWith('⚠️') ? (
            <button
              onClick={handleSubmit}
              style={{
                marginTop: '10px',
                padding: '8px 14px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                backgroundColor: '#f0f0f0',
                cursor: 'pointer',
              }}
            >
              🔄 إعادة المحاولة
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
