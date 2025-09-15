import React, { useState } from 'react';
import { StylePair } from '../types';
import TrashIcon from './icons/TrashIcon';
import PlusIcon from './icons/PlusIcon';
import DownloadIcon from './icons/DownloadIcon';
import UploadIcon from './icons/UploadIcon';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface TrainingViewProps {
  pairs: StylePair[];
  onAddPair: (pair: { before: string; after:string }) => Promise<void>;
  onDeletePair: (id: string) => Promise<void>;
  onAddPairsBatch: (pairs: { before: string; after: string }[]) => Promise<void>;
}

const TrainingView: React.FC<TrainingViewProps> = ({ pairs, onAddPair, onDeletePair, onAddPairsBatch }) => {
  const [beforeText, setBeforeText] = useLocalStorage('draft_beforeText', '');
  const [afterText, setAfterText] = useLocalStorage('draft_afterText', '');
  const [showImportExport, setShowImportExport] = useState(false);
  const [separator, setSeparator] = useState('---');
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [textFile, setTextFile] = useState<File | null>(null);

  const handleAddPair = async () => {
    if (beforeText.trim() && afterText.trim()) {
      await onAddPair({ before: beforeText, after: afterText });
      setBeforeText('');
      setAfterText('');
    }
  };

  const processJsonFile = () => {
    if (!jsonFile) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error('لا يمكن قراءة محتوى الملف.');
        }

        const data = JSON.parse(text);
        let potentialPairs: any[] = [];

        if (Array.isArray(data)) {
          potentialPairs = data;
        } else {
          throw new Error('صيغة JSON غير صالحة. يجب أن يحتوي الملف على مصفوفة من كائنات التدريب.');
        }

        const validPairs: { before: string; after: string }[] = potentialPairs
          .map(p => {
            if (typeof p !== 'object' || p === null || !('before' in p) || !('after' in p)) {
              return null;
            }
            const before = String(p.before).trim();
            const after = String(p.after).trim();

            if (!before || !after) {
              return null;
            }
            
            return { before, after };
          })
          .filter((p): p is { before: string; after: string } => p !== null);
        
        if (validPairs.length === 0) {
            throw new Error('لم يتم العثور على أزواج تدريب صالحة في الملف.');
        }
        
        const existingPairsSet = new Set(pairs.map(p => `${p.before.trim()}|||${p.after.trim()}`));
        const newUniquePairs = validPairs.filter(p => !existingPairsSet.has(`${p.before.trim()}|||${p.after.trim()}`));
        
        const addedCount = newUniquePairs.length;
        const skippedCount = validPairs.length - addedCount;

        if (addedCount > 0) {
          await onAddPairsBatch(newUniquePairs);
        }

        let alertMessage = `اكتملت المعالجة.\n\n`;
        if (addedCount > 0) {
          alertMessage += `✅ تمت إضافة ${addedCount} زوجًا جديدًا.\n`;
        } else {
           alertMessage += `- لم يتم إضافة أزواج جديدة.\n`;
        }
        if (skippedCount > 0) {
            alertMessage += `ℹ️ تم تخطي ${skippedCount} زوجًا لأنها موجودة بالفعل.\n`;
        }
       
        alert(alertMessage.trim());

      } catch (error) {
        alert(`خطأ في الاستيراد: ${(error as Error).message}`);
        console.error(error);
      } finally {
        setJsonFile(null);
      }
    };
    reader.onerror = () => {
      alert('حدث خطأ أثناء قراءة الملف.');
      setJsonFile(null);
    };
    reader.readAsText(jsonFile);
  };

  const processTextFile = async () => {
    if (!textFile) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const text = e.target?.result;
            if (typeof text !== 'string') throw new Error('لا يمكن قراءة محتوى الملف.');
            if (!separator.trim()) throw new Error('يجب تحديد الفاصل.');
            
            const pairBlocks = text.split(/\n\s*\n/).filter(block => block.trim() !== '');
            
            const parsedPairs = pairBlocks.map((block) => {
                const parts = block.split(separator);
                if (parts.length !== 2) return null;
                const before = parts[0].trim();
                const after = parts[1].trim();
                if (!before || !after) return null;
                return { before, after };
            }).filter((p): p is { before: string; after: string } => p !== null);

            if (parsedPairs.length === 0) {
                 throw new Error('لم يتم العثور على أزواج صالحة في الملف.');
            }

            const existingPairsSet = new Set(pairs.map(p => `${p.before.trim()}|||${p.after.trim()}`));
            const newUniquePairs = parsedPairs.filter(p => !existingPairsSet.has(`${p.before.trim()}|||${p.after.trim()}`));

            if (newUniquePairs.length > 0) {
                await onAddPairsBatch(newUniquePairs);
                alert(`تم استيراد وإضافة ${newUniquePairs.length} زوجًا جديدًا بنجاح!`);
            } else {
                alert('لم يتم العثور على أزواج جديدة غير مكررة في الملف.');
            }

        } catch (error) {
            alert(`خطأ في الاستيراد: ${(error as Error).message}`);
            console.error(error);
        } finally {
            setTextFile(null);
        }
    };
    reader.readAsText(textFile);
  };
  
  const handleJsonFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setJsonFile(file);
    event.target.value = '';
  };

  const handleTextFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setTextFile(file);
    event.target.value = '';
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">خانة التدريب</h2>
        <p className="text-gray-600">أضف أزواج النصوص هنا لتعليم التطبيق أسلوبك في الكتابة. كلما زادت الأمثلة، كانت النتائج أفضل.</p>
      </div>

      {/* Add New Pair Card */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-blue-600">إضافة زوج جديد</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <textarea
            value={beforeText}
            onChange={(e) => setBeforeText(e.target.value)}
            placeholder="النص قبل التحرير (الأسلوب الأصلي)"
            className="w-full p-3 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 transition"
            aria-label="النص قبل التحرير"
          />
          <textarea
            value={afterText}
            onChange={(e) => setAfterText(e.target.value)}
            placeholder="النص بعد التحرير (أسلوبك الشخصي)"
            className="w-full p-3 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 transition"
            aria-label="النص بعد التحرير"
          />
        </div>
        <button
          onClick={handleAddPair}
          disabled={!beforeText.trim() || !afterText.trim()}
          className="mt-4 flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          <PlusIcon />
          <span>إضافة زوج</span>
        </button>
      </div>
      
      {/* Statistics and Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-100 rounded-lg">
            <div className="text-sm text-gray-700">
                <p><strong>إجمالي الأزواج المحفوظة في الخادم:</strong> {pairs.length}</p>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => setShowImportExport(!showImportExport)} className="flex items-center gap-2 text-sm bg-gray-200 py-2 px-4 rounded-lg hover:bg-gray-300 font-semibold transition" aria-expanded={showImportExport}>
                    <DownloadIcon/>
                    <span>استيراد / تصدير</span>
                </button>
            </div>
        </div>

      {/* Import/Export Section */}
      {showImportExport && (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-blue-600">تصدير بيانات التدريب</h3>
                <p className="text-sm text-gray-600 mb-2">انسخ هذا النص واحفظه في ملف بصيغة JSON لاستيراده لاحقًا.</p>
                <textarea readOnly value={JSON.stringify(pairs, null, 2)} className="w-full h-40 p-2 border rounded-md bg-gray-50 font-mono text-sm" aria-label="بيانات التدريب للتصدير"/>
              </div>
              <hr/>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold mb-2 text-blue-600">استيراد من ملف JSON</h3>
                <p className="text-sm text-gray-600 mb-2">اختر ملف JSON لإضافة أزواج تدريب جديدة. لن تتم إضافة الأزواج المكررة.</p>
                <div className="flex items-center gap-4 flex-wrap">
                    <input type="file" id="file-upload" accept=".json,application/json" className="hidden" onChange={handleJsonFileSelect} />
                    <label htmlFor="file-upload" role="button" className="cursor-pointer inline-flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition">
                        <UploadIcon />
                        <span>اختر ملف JSON...</span>
                    </label>
                    <button onClick={processJsonFile} disabled={!jsonFile} className="flex items-center gap-2 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed">
                        <span>تنفيذ استيراد JSON</span>
                    </button>
                </div>
                {jsonFile && <p className="text-sm font-medium text-gray-700 mt-2">الملف المحدد: <span className="font-mono">{jsonFile.name}</span></p>}
              </div>
              <hr/>
               <div className="space-y-3">
                <h3 className="text-lg font-semibold mb-2 text-blue-600">تعبئة آلية من ملف نصي</h3>
                <p className="text-sm text-gray-600 mb-2">ارفع ملفًا نصيًا (.txt) لتوزيع محتواه تلقائيًا على خانات التدريب.</p>
                <div>
                    <label htmlFor="separator-input" className="block text-sm font-medium text-gray-700 mb-1">الفاصل بين 'قبل' و 'بعد':</label>
                    <input type="text" id="separator-input" value={separator} onChange={(e) => setSeparator(e.target.value)} className="w-full md:w-1/2 p-2 border border-gray-300 rounded-md shadow-sm"/>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                    <input type="file" id="text-file-upload" accept=".txt,text/plain" className="hidden" onChange={handleTextFileSelect} />
                    <label htmlFor="text-file-upload" role="button" className="cursor-pointer inline-flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition">
                        <UploadIcon />
                        <span>اختر ملفًا نصيًا...</span>
                    </label>
                    <button onClick={processTextFile} disabled={!textFile} className="flex items-center gap-2 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed">
                        <span>تنفيذ التعبئة الآلية</span>
                    </button>
                </div>
                {textFile && <p className="text-sm font-medium text-gray-700 mt-2">الملف المحدد: <span className="font-mono">{textFile.name}</span></p>}
              </div>
          </div>
      )}

      {/* Existing Pairs List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800">الأزواج المحفوظة</h3>
        {pairs.length === 0 ? (
          <p className="text-gray-500 text-center py-4">لا توجد أزواج محفوظة في الخادم.</p>
        ) : (
          pairs.map((pair) => (
            <div key={pair._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200" role="listitem">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-500">قبل:</p>
                  <p className="text-gray-800 mb-2 whitespace-pre-wrap">{pair.before}</p>
                  <p className="text-sm font-semibold text-green-600">بعد:</p>
                  <p className="text-gray-800 whitespace-pre-wrap">{pair.after}</p>
                </div>
                <button onClick={() => onDeletePair(pair._id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition" aria-label={`حذف الزوج`}>
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TrainingView;
