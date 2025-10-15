import React, { useState } from 'react';
import { ContentItem, Workflow } from '../types';
import { PROCESS_WORKFLOWS } from '../constants';
import PublishingModal from './PublishingModal';

interface ContentDetailViewProps {
  item: ContentItem | null;
  onStartProcessWorkflow: (workflow: Workflow, item: ContentItem) => void;
  onPublish: (item: ContentItem, channels: string[]) => void;
}

const ContentDetailView: React.FC<ContentDetailViewProps> = ({ item, onStartProcessWorkflow, onPublish }) => {
  const [isPublishing, setIsPublishing] = useState(false);
  
  if (!item) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <i className="fas fa-mouse-pointer fa-3x mb-4"></i>
          <p className="font-semibold">اختر عنصرًا من القائمة لعرض التفاصيل</p>
        </div>
      </div>
    );
  }

  const handlePublish = (channels: string[]) => {
    onPublish(item, channels);
    setIsPublishing(false);
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full overflow-y-auto">
      <div className="border-b pb-4 mb-4">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">{item.title}</h2>
            <button 
              onClick={() => setIsPublishing(true)}
              className="bg-green-600 text-white py-2 px-5 rounded-md hover:bg-green-700 transition duration-300 flex items-center"
            >
              <i className="fas fa-paper-plane mr-2"></i>
              نشر
            </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">المصدر: {item.source} | الحالة: {item.status}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main Content */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
            <i className={`${item.mainOutput.icon} ml-2 text-blue-600`}></i>
            {item.mainOutput.type} (المخرج الرئيسي)
          </h3>
          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{item.mainOutput.content}</p>
        </div>
        
        {/* Additional Outputs */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">مخرجات إضافية</h3>
          {item.additionalOutputs.length > 0 ? (
            item.additionalOutputs.map(output => (
              <div key={output.id} className="bg-gray-50 p-4 rounded-lg border">
                 <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                    <i className={`${output.icon} ml-2 text-purple-600`}></i>
                    {output.type}
                </h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{output.content}</p>
              </div>
            ))
          ) : (
             <p className="text-sm text-gray-500">لا توجد مخرجات إضافية بعد. قم بتشغيل عملية لإنشاء واحدة.</p>
          )}
        </div>
      </div>
      
      {/* Actions */}
      <div className="mt-6 border-t pt-4">
        <h3 className="font-semibold text-gray-700 mb-3">عمليات إضافية</h3>
        <p className="text-sm text-gray-500 mb-4">اختر إحدى العمليات التالية لتوليد مخرجات جديدة من المحتوى الرئيسي.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {PROCESS_WORKFLOWS.map(workflow => (
            <button 
              key={workflow.id}
              onClick={() => onStartProcessWorkflow(workflow, item)}
              className="flex flex-col items-center justify-start text-center p-4 bg-gray-50 border rounded-lg hover:bg-gray-100 hover:shadow-md transition duration-300 space-y-2"
            >
              <i className={`${workflow.icon} text-3xl text-gray-600`}></i>
              <span className="font-semibold text-sm text-gray-800">{workflow.name}</span>
              <p className="text-xs text-gray-500">{workflow.description}</p>
            </button>
          ))}
        </div>
      </div>

      {isPublishing && (
          <PublishingModal
            itemTitle={item.title}
            onClose={() => setIsPublishing(false)}
            onPublish={handlePublish}
          />
      )}

    </div>
  );
};

export default ContentDetailView;