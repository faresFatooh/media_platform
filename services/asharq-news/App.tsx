
import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Integrations from './pages/Integrations';
import Sources from './pages/Sources';
import Queue from './pages/Queue';
import Archive from './pages/Archive';
import Settings from './pages/Settings';
import NewsEditor from './pages/NewsEditor';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="flex h-screen bg-background text-text-primary font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/sources" element={<Sources />} />
              <Route path="/queue" element={<Queue />} />
              <Route path="/editor/:id" element={<NewsEditor />} />
              <Route path="/archive" element={<Archive />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
