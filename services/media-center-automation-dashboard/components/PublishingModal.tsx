
import React, { useState } from 'react';
import { CHANNELS } from '../constants';

interface PublishingModalProps {
  itemTitle: string;
  onClose: () => void;
  onPublish: (channels: string[]) => void;
}

const PublishingModal: React.FC<PublishingModalProps> = ({ itemTitle, onClose, onPublish }) => {
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);

  const toggleChannel = (channelId: string) => {
    setSelectedChannels(prev =>
      prev.includes(channelId)
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  };

  const handlePublishClick = () => {
    if (selectedChannels.length > 0) {
      onPublish(selectedChannels);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-bold text-gray-800">نشر المحتوى</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <i className="fas fa-times fa-lg"></i>
          </button>
        </div>
        
        <p className="mb-4 text-gray-600">أنت على وشك نشر: <span className="font-semibold text-gray-900">{itemTitle}</span></p>
        
        <h3 className="font-semibold text-gray-700 mb-3">اختر القنوات للنشر عليها:</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
          {CHANNELS.map(channel => (
            <div
              key={channel.id}
              onClick={() => toggleChannel(channel.id)}
              className={`p-4 border-2 rounded-lg cursor-pointer flex flex-col items-center justify-center transition-all duration-200 ${
                selectedChannels.includes(channel.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <i className={`${channel.icon} fa-2x mb-2 ${channel.color}`}></i>
              <span className="font-semibold text-gray-700">{channel.name}</span>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end space-x-3 space-x-reverse">
          <button onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
            إلغاء
          </button>
          <button
            onClick={handlePublishClick}
            disabled={selectedChannels.length === 0}
            className="py-2 px-6 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            نشر الآن
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublishingModal;
