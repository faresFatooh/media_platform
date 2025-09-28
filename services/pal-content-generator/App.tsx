
import React from 'react';
import Header from './components/Header';
import ContentDashboard from './components/ContentDashboard';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <ContentDashboard />
      </main>
      <footer className="text-center py-4 text-gray-500 text-sm">
        <p>تم التطوير بواسطة مهندس React خبير بواجهة Gemini API.</p>
      </footer>
    </div>
  );
};

export default App;
