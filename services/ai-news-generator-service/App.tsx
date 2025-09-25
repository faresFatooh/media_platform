
import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ArticleGenerator } from './components/features/ArticleGenerator';
import { BreakingNews } from './components/features/BreakingNews';
import { SourceMonitor } from './components/features/SourceMonitor';
import { TrainingExamples } from './components/features/TrainingExamples';
import type { View } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('generator');

  const renderContent = () => {
    switch (activeView) {
      case 'generator':
        return <ArticleGenerator />;
      case 'breakingNews':
        return <BreakingNews />;
      case 'monitor':
        return <SourceMonitor />;
      case 'trainingExamples':
        return <TrainingExamples />;
      default:
        return <ArticleGenerator />;
    }
  };

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