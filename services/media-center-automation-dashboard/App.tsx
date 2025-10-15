import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import ContentFeed from './components/ContentFeed';
import ContentDetailView from './components/ContentDetailView';
import { ContentItem, ContentStatus, Workflow, Output } from './types';
import { initialContentItems } from './services/mockData';
import { triggerInputWorkflow, triggerProcessWorkflow } from './services/n8nService';

const App: React.FC = () => {
  const [contentItems, setContentItems] = useState<ContentItem[]>(initialContentItems);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(initialContentItems.length > 0 ? initialContentItems[0].id : null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAutomationOn, setIsAutomationOn] = useState<boolean>(false);

  const automationIntervalRef = useRef<number | null>(null);

  const handleSelectItem = (id: string) => {
    setSelectedItemId(id);
  };

  const handleStartWorkflow = useCallback(async (workflow: Workflow) => {
    setIsLoading(true);
    try {
      const newItemData = await triggerInputWorkflow(workflow);
      const newItem: ContentItem = {
        id: `item-${Date.now()}`,
        createdAt: 'الآن',
        ...newItemData,
      };
      setContentItems(prevItems => [newItem, ...prevItems]);
      setSelectedItemId(newItem.id);
    } catch (error) {
      console.error("Failed to start workflow:", error);
      // Here you might want to show an error notification to the user
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleStartProcessWorkflow = async (workflow: Workflow, item: ContentItem) => {
    // Optionally, show a specific loading state for the item
    const newOutput = await triggerProcessWorkflow(workflow, item);
    if (newOutput) {
      setContentItems(prevItems =>
        prevItems.map(currentItem =>
          currentItem.id === item.id
            ? { ...currentItem, additionalOutputs: [...currentItem.additionalOutputs, newOutput] }
            : currentItem
        )
      );
    }
  };

  const handlePublish = (item: ContentItem, channels: string[]) => {
    setContentItems(prevItems =>
      prevItems.map(currentItem =>
        currentItem.id === item.id
          ? { ...currentItem, status: ContentStatus.PUBLISHED, publishedTo: [...new Set([...currentItem.publishedTo, ...channels])] }
          : currentItem
      )
    );
  };
  
  const handleToggleAutomation = () => {
    setIsAutomationOn(prev => !prev);
  };

  useEffect(() => {
    if (isAutomationOn) {
      // For demonstration, run every 15 seconds instead of every hour
      automationIntervalRef.current = window.setInterval(() => {
        console.log("Automation Triggered: Fetching news...");
        handleStartWorkflow({
            id: 'scrape-arabic',
            name: 'سحب تلقائي من مواقع عربية',
            description: 'جلب الأخبار من مواقع عربية مخصصة.',
            icon: 'fa-solid fa-robot',
            type: 'input'
        });
      }, 15000); // 15 seconds
    } else {
      if (automationIntervalRef.current) {
        clearInterval(automationIntervalRef.current);
        automationIntervalRef.current = null;
      }
    }

    return () => {
      if (automationIntervalRef.current) {
        clearInterval(automationIntervalRef.current);
      }
    };
  }, [isAutomationOn, handleStartWorkflow]);

  const selectedItem = contentItems.find(item => item.id === selectedItemId) || null;

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col" dir="rtl">
      <Header />
      <main className="flex-grow container mx-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full" style={{minHeight: 'calc(100vh - 100px)'}}>
          
          {/* Right Panel: Inputs */}
          <div className="lg:col-span-3 h-full">
            <InputPanel 
              onStartWorkflow={handleStartWorkflow} 
              isLoading={isLoading}
              isAutomationOn={isAutomationOn}
              onToggleAutomation={handleToggleAutomation}
            />
          </div>

          {/* Middle Panel: Content Feed */}
          <div className="lg:col-span-4 h-full">
            <ContentFeed
              items={contentItems}
              selectedItemId={selectedItemId}
              onSelectItem={handleSelectItem}
            />
          </div>

          {/* Left Panel: Details View */}
          <div className="lg:col-span-5 h-full">
            <ContentDetailView 
              item={selectedItem}
              onStartProcessWorkflow={handleStartProcessWorkflow}
              onPublish={handlePublish}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
