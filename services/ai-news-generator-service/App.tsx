
import React from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ArticleGenerator } from './components/features/ArticleGenerator';
import { BreakingNews } from './components/features/BreakingNews';
import { SourceMonitor } from './components/features/SourceMonitor';
import type { View } from './types';
import { useAuth } from './context/AuthContext';
import { LoginScreen } from './components/auth/LoginScreen';
import { Spinner } from './components/common/Spinner';

const App: React.FC = () => {
  const [activeView, setActiveView] = React.useState<View>('generator');
  const { isAuthenticated, isLoading } = useAuth();

  const renderContent = () => {
    switch (activeView) {
      case 'generator':
        return <ArticleGenerator />;
      case 'breakingNews':
        return <BreakingNews />;
      case 'monitor':
        return <SourceMonitor />;
      default:
        return <ArticleGenerator />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;