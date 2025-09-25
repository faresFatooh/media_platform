import React, { useState, useEffect, useCallback } from 'react';
import { get, post, put, del, ApiError } from '../../services/apiService';
import type { EditorialStyle } from '../../types';
import { Spinner } from '../common/Spinner';
import { PlusIcon, PencilIcon, TrashIcon } from '../icons/Icons';

// Modal component for Add/Edit form
const StyleFormModal: React.FC<{
  style: Partial<EditorialStyle> | null;
  onSave: (style: Omit<EditorialStyle, 'id' | 'user' | 'created_at' | 'updated_at'>) => void;
  onClose: () => void;
  isSaving: boolean;
}> = ({ style, onSave, onClose, isSaving }) => {
  const [name, setName] = useState(style?.name || '');
  const [content, setContent] = useState(style?.content || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && content.trim()) {
      onSave({ name, content });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gray-800 p-6 rounded-lg shadow-2xl border border-gray-700 w-full max-w-2xl">
        <h3 className="text-2xl font-bold text-cyan-400 mb-4">
          {style?.id ? 'تعديل الأسلوب' : 'إضافة أسلوب جديد'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="style-name" className="block text-sm font-medium text-gray-300 mb-1">
              اسم الأسلوب
            </label>
            <input
              id="style-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: أسلوب إخباري محايد"
              className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="style-content" className="block text-sm font-medium text-gray-300 mb-1">
              المحتوى (التعليمات والأمثلة)
            </label>
            <textarea
              id="style-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="أضف هنا التعليمات والأمثلة التي سيتبعها الذكاء الاصطناعي..."
              rows={10}
              className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500"
              required
            ></textarea>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-700 rounded-md transition-colors">
              إلغاء
            </button>
            <button type="submit" disabled={isSaving} className="py-2 px-4 bg-cyan-600 hover:bg-cyan-700 rounded-md transition-colors disabled:bg-gray-500">
              {isSaving ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const TrainingExamples: React.FC = () => {
  const [styles, setStyles] = useState<EditorialStyle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<EditorialStyle | null>(null);

  const fetchStyles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await get<EditorialStyle[]>('/styles/');
      setStyles(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'فشل في جلب البيانات.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStyles();
  }, [fetchStyles]);

  const handleOpenModal = (style: EditorialStyle | null = null) => {
    setSelectedStyle(style);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStyle(null);
  };

  const handleSave = async (data: Omit<EditorialStyle, 'id' | 'user' | 'created_at' | 'updated_at'>) => {
    setIsSaving(true);
    setError(null);
    try {
      if (selectedStyle) {
        // Update existing style
        await put(`/styles/${selectedStyle.id}/`, data);
      } else {
        // Create new style
        await post('/styles/', data);
      }
      handleCloseModal();
      await fetchStyles(); // Refresh data
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'فشل في حفظ التغييرات.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('هل أنت متأكد من أنك تريد حذف هذا الأسلوب؟')) {
      try {
        setError(null);
        await del(`/styles/${id}/`);
        await fetchStyles(); // Refresh data
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'فشل في حذف الأسلوب.');
      }
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-cyan-400">إدارة الأساليب التحريرية</h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
        >
          <PlusIcon className="w-5 h-5" />
          إضافة أسلوب جديد
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 p-3 rounded-md mb-4">
          <p><strong>خطأ:</strong> {error}</p>
        </div>
      )}

      <div className="bg-gray-800/50 p-4 rounded-lg shadow-lg border border-gray-700">
        <div className="space-y-3">
          {styles.length > 0 ? (
            styles.map(style => (
              <div key={style.id} className="bg-gray-900/50 p-4 rounded-md border border-gray-700 flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-lg text-gray-100">{style.name}</h4>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">{style.content}</p>
                  <p className="text-xs text-gray-500 mt-2">آخر تحديث: {new Date(style.updated_at).toLocaleString('ar-EG')}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0 ml-4">
                  <button onClick={() => handleOpenModal(style)} className="p-2 text-gray-400 hover:text-cyan-400 transition-colors" title="تعديل">
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(style.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="حذف">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>لم تتم إضافة أي أساليب تحريرية بعد.</p>
              <p>انقر على "إضافة أسلوب جديد" للبدء.</p>
            </div>
          )}
        </div>
      </div>
      
      {isModalOpen && <StyleFormModal style={selectedStyle} onSave={handleSave} onClose={handleCloseModal} isSaving={isSaving} />}
    </div>
  );
};
