
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}
console.log("🌍 VITE_MAIN_BACKEND_URL:", import.meta.env.VITE_MAIN_BACKEND_URL);
console.log("🔑 VITE_GEMINI_API_KEY:", import.meta.env.VITE_GEMINI_API_KEY);
console.log("🤖 VITE_CLAUDE_PROXY_URL:", import.meta.env.VITE_CLAUDE_PROXY_URL);

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);