import React, { useState, useCallback } from 'react';
import Card from './Card';
import { TextIcon } from './icons/TextIcon';
import { LinkIcon } from './icons/LinkIcon';
import { DocumentIcon } from './icons/DocumentIcon';

interface InputStepProps {
  onGenerateScript: (content: string) => void;
}

type InputMode = 'text' | 'url' | 'file';

const InputStep: React.FC<InputStepProps> = ({ onGenerateScript }) => {
  const [mode, setMode] = useState<InputMode>('text');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');

  const canSubmit = text.length > 20 || url.length > 10 || !!file;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
      
      if (selectedFile.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => {
          setText(e.target?.result as string);
        };
        reader.readAsText(selectedFile);
      } else {
        // For non-txt files, we'll just use a placeholder text.
        // In a real app, this would involve a backend to parse PDF/DOCX.
        setText(`محتوى من ملف: ${selectedFile.name}`);
      }
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    
    let content = '';
    if (mode === 'text' || mode === 'file') {
      content = text;
    } else if (mode === 'url') {
      // In a real app, you'd fetch and parse the URL content on a server.
      // Here, we simulate it by passing the URL to Gemini.
      content = `الرجاء تلخيص المحتوى من هذا الرابط: ${url}`;
    }
    onGenerateScript(content);
  };
  
  const ModeButton = ({ id, label, icon }: { id: InputMode, label: string, icon: React.ReactNode }) => (
    <button
      type="button"
      onClick={() => setMode(id)}
      className={`flex-1 p-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors duration-200 rounded-t-lg ${
        mode === id ? 'bg-base-200 text-brand-light border-b-2 border-brand-primary' : 'bg-base-300 text-content hover:bg-base-200'
      }`}
    >
      {icon} {label}
    </button>
  );

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <div className="flex border-b border-base-300">
          <ModeButton id="text" label="لصق نص" icon={<TextIcon />} />
          <ModeButton id="url" label="من رابط" icon={<LinkIcon />} />
          <ModeButton id="file" label="رفع ملف" icon={<DocumentIcon />} />
        </div>

        <div className="p-6">
          {mode === 'text' && (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="الصق مقالك، أو نصك، أو أي محتوى نصي هنا..."
              className="w-full h-48 p-3 bg-base-100 border border-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
            />
          )}
          {mode === 'url' && (
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              className="w-full p-3 bg-base-100 border border-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
            />
          )}
          {mode === 'file' && (
             <div className="flex items-center justify-center w-full">
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-base-300 border-dashed rounded-lg cursor-pointer bg-base-300 hover:bg-base-200 transition">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <DocumentIcon />
                        <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">انقر للرفع</span> أو اسحب وأفلت</p>
                        <p className="text-xs text-gray-500">PDF, DOCX, TXT (تتم معالجة TXT محليًا)</p>
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt" />
                </label>
            </div> 
          )}
          {fileName && mode === 'file' && <p className="text-sm mt-3 text-center text-gray-400">الملف المحدد: {fileName}</p>}
        </div>

        <div className="px-6 pb-6 text-center">
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full sm:w-auto px-8 py-3 bg-brand-primary text-white font-bold rounded-lg disabled:bg-base-300 disabled:cursor-not-allowed hover:bg-brand-dark transition-transform transform hover:scale-105"
          >
            إنشاء النص
          </button>
        </div>
      </form>
    </Card>
  );
};

export default InputStep;