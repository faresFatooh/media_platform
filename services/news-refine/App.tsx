import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { NewsRefine } from './components/NewsRefine';
import { ContentPipeline } from './components/ContentPipeline';
import { TranscriptionTool } from './components/TranscriptionTool';
import { MediaTools } from './components/MediaTools';
import { Community } from './components/Community';
import { Management } from './components/Management';
import type { User, View, NewsRefineOutput } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = sessionStorage.getItem('newsRefine_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [latestArticle, setLatestArticle] = useState<NewsRefineOutput | null>(null);


  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    sessionStorage.setItem('newsRefine_user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem('newsRefine_user');
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'news_refine':
        return <NewsRefine onArticleGenerated={setLatestArticle} />;
      case 'content_pipeline':
        return <ContentPipeline />;
      case 'transcription':
        return <TranscriptionTool />;
      case 'media_tools':
        return <MediaTools latestArticle={latestArticle} />;
      case 'community':
        return <Community />;
      case 'management':
        return <Management />;
      default:
        return <Dashboard />;
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        isOpen={isSidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <div className="flex-1 flex flex-col transition-all duration-300 md:mr-64">
        <Header 
          user={user}
          onLogout={handleLogout}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default App;