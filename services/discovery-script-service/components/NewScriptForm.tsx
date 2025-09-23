import React, { useState, useEffect } from 'react';
import { Script, FactCheckResult, NotificationMessage, Style, ApiStatuses, GenerationEngine } from '../types';
import { generateScript, generateIdeas, deepResearch, factCheckScript } from '../services/geminiService';
import { transformWithClaude } from '../services/claudeService';
import { generateWithChatGPT } from '../services/chatGptService';
import Modal from './Modal';
import AssetGenerationModal from './AssetGenerationModal';

interface NewScriptFormProps {
    styles: Style[];
    addNotification: (message: string, type: NotificationMessage['type']) => void;
    onScriptGenerated: (script: Script) => void;
    onFactCheckComplete: (result: FactCheckResult) => void;
    onAddToTraining: (styleId: string, originalContent: string, editedContent: string) => void;
    initialScript: Script | null;
    apiStatuses: ApiStatuses;
}

const Spinner: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={`animate-spin ${className || 'h-5 w-5 text-white'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const ActionButton: React.FC<{ onClick: () => void, text: string, icon: string, color: string, isLoading: boolean, disabled?: boolean }> = ({ onClick, text, icon, color, isLoading, disabled = false }) => (
    <button onClick={onClick} disabled={isLoading || disabled} className={`flex items-center justify-center gap-2 w-full sm:w-auto text-white font-bold py-3 px-6 rounded-lg shadow-md hover:-translate-y-0.5 transform transition duration-300 ${color} ${isLoading || disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'}`}>
        {isLoading ? <Spinner /> : <span>{icon}</span>}
        <span>{text}</span>
    </button>
);

const renderScriptContent = (text: string) => {
    if (!text) return '';
    const escapedText = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const footnoteRegex = /\[(\d+)\]/g;
    const contentWithFootnotes = escapedText.replace(
        footnoteRegex,
        '<sup class="font-bold mx-0.5"><a href="#source-$1" class="text-primary hover:underline" title="اذهب إلى المصدر رقم $1">[$1]</a></sup>'
    );
    
    return contentWithFootnotes.replace(/\n/g, '<br/>');
};

const exportToWord = (script: Script, editedContent: string) => {
    const contentHtml = renderScriptContent(editedContent);
    
    let sourcesHtml = '<h2>المصادر</h2><ol>';
    script.sources.forEach((source, index) => {
        sourcesHtml += `<li style="margin-bottom: 8px;">${source.name} - <a href="${source.url}">${source.url}</a></li>`;
    });
    sourcesHtml += '</ol>';

    const fullHtml = `<div dir="rtl" style="font-family: Arial, sans-serif;">${contentHtml}<br/><hr/><br/>${sourcesHtml}</div>`;
    
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' "+
        "xmlns:w='urn:schemas-microsoft-com:office:word' "+
        "xmlns='http://www.w3.org/TR/REC-html40'>"+
        "<head><meta charset='utf-8'><title>Export HTML to Word Document</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + fullHtml + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${script.title}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
};

const NewScriptForm: React.FC<NewScriptFormProps> = ({ styles, addNotification, onScriptGenerated, onFactCheckComplete, initialScript, onAddToTraining, apiStatuses }) => {
  const [selectedStyleId, setSelectedStyleId] = useState(styles[0]?.id || '');
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('22');
  const [language, setLanguage] = useState('ar');
  const [sourceText, setSourceText] = useState('');
  const [script, setScript] = useState<Script | null>(initialScript);
  const [editedContent, setEditedContent] = useState('');
  const [loadingStates, setLoadingStates] = useState({ generate: false, ideas: false, research: false, factCheck: false });
  const [isIdeasModalOpen, setIsIdeasModalOpen] = useState(false);
  const [ideasModalContent, setIdeasModalContent] = useState({ title: '', content: '' });
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [engine, setEngine] = useState<GenerationEngine>('gemini');

  const selectedStyle = styles.find(s => s.id === selectedStyleId);
  const canUseClaudeForTransform = apiStatuses.claude === 'connected' && sourceText.trim() !== '';

  useEffect(() => {
    if (initialScript) {
      setTitle(initialScript.title);
      setScript(initialScript);
      setEditedContent(initialScript.content);
      setIsPreview(true);
    }
  }, [initialScript]);

  // ✅ الدالة الناقصة: handleApiCall
  const handleApiCall = async (apiCall: () => Promise<Script>) => {
    setLoadingStates(prev => ({ ...prev, generate: true }));
    try {
      const newScript = await apiCall();
      setScript(newScript);
      setEditedContent(newScript.content);
      onScriptGenerated(newScript);
      addNotification('تم توليد النص بنجاح ✅', 'success');
    } catch (err) {
      addNotification('فشل في توليد النص ❌', 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, generate: false }));
    }
  };

  const handleTransformScript = () => {
    if (!selectedStyleId || !title || !sourceText) {
      addNotification('الرجاء اختيار أسلوب، إدخال عنوان، وتوفير نص مصدري للتحويل.', 'error');
      return;
    }
    handleApiCall(async () => {
      if (canUseClaudeForTransform) {
        addNotification('يتم التحويل باستخدام محرك Claude السريع...', 'info');
        return transformWithClaude(selectedStyle?.name || '', title, duration, language, sourceText, selectedStyle?.trainingData);
      } else {
        addNotification('يتم التحويل باستخدام محرك Gemini...', 'info');
        return generateScript(selectedStyle?.name || '', title, duration, language, sourceText, selectedStyle?.trainingData, 'gemini', addNotification);
      }
    });
  };

  const handleGenerateFromTitle = () => {
    if (!selectedStyleId || !title) {
      addNotification('الرجاء اختيار أسلوب وإدخال عنوان الحلقة', 'error');
      return;
    }
    handleApiCall(async () => generateScript(selectedStyle?.name || '', title, duration, language, '', selectedStyle?.trainingData, engine, addNotification));
  };

  const handleGenerateClick = () => {
    if (sourceText.trim() !== '') {
      handleTransformScript();
    } else {
      handleGenerateFromTitle();
    }
  };

  const handleAddToTrainingClick = () => {
    if (script && editedContent.trim() !== script.content.trim()) {
      onAddToTraining(selectedStyleId, script.content, editedContent);
    } else {
      addNotification('لا يوجد تغييرات لإضافتها للتدريب.', 'warning');
    }
  };
  
  const handleGenerateIdeas = async () => {
    if(!selectedStyleId) {
      addNotification('الرجاء اختيار أسلوب أولاً', 'warning');
      return;
    }
    setLoadingStates(prev => ({ ...prev, ideas: true }));
    try {
      const selectedStyleForIdeas = styles.find(p => p.id === selectedStyleId);
      const ideas = await generateIdeas(selectedStyleForIdeas?.name || '');
      setIdeasModalContent({ title: 'أفكار للحلقات', content: ideas.join('\n') });
      setIsIdeasModalOpen(true);
    } catch (error) {
      addNotification('فشل في توليد الأفكار', 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, ideas: false }));
    }
  };
  
  const handleDeepResearch = async () => {
    if(!title) {
      addNotification('الرجاء إدخال عنوان أو موضوع للبحث', 'warning');
      return;
    }
    setLoadingStates(prev => ({ ...prev, research: true }));
    try {
      const { research, sources } = await deepResearch(title);
      const sourcesText = sources.map(s => `[${s.name}](${s.url})`).join('\n');
      setIdeasModalContent({ title: 'نتائج البحث المعمق', content: `${research}\n\n**المصادر:**\n${sourcesText}` });
      setIsIdeasModalOpen(true);
    } catch (error) {
      addNotification('فشل البحث المعمق', 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, research: false }));
    }
  };

  const handleFactCheck = async () => {
    const contentToCheck = editedContent || script?.content;
    if (!contentToCheck) {
      addNotification('لا يوجد نص لتدقيق الحقائق. الرجاء توليد نص أولاً.', 'warning');
      return;
    }
    setLoadingStates(prev => ({ ...prev, factCheck: true }));
    try {
      const result = await factCheckScript(contentToCheck);
      onFactCheckComplete(result);
      addNotification('تم إكمال تدقيق الحقائق بنجاح', 'success');
    } catch (error) {
      addNotification('فشل تدقيق الحقائق', 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, factCheck: false }));
    }
  };

  const getEngineTooltip = (engine: GenerationEngine) => {
    switch(engine) {
      case 'hybrid': return "يستخدم كل المحركات المتصلة (Gemini, Claude, ChatGPT) للبحث ثم يدمج النتائج لكتابة نص فائق الدقة.";
      case 'cross': return "يستخدم Claude للبحث الأولي، ChatGPT للبحث المعمق، ثم Gemini للكتابة والتدقيق النهائي.";
      default: return `استخدام ${engine} لتوليد النص.`;
    }
  }



    return (
        <div className="space-y-8">
            <div className="bg-card-bg-light dark:bg-card-bg-dark p-6 rounded-lg shadow-md border border-border-light dark:border-border-dark">
                <h2 className="text-2xl font-bold mb-6 text-text-primary-light dark:text-text-primary-dark flex items-center gap-3">
                    <span>✍️</span>
                    إنشاء نص جديد
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark mb-2">اختر الأسلوب</label>
                        <select value={selectedStyleId} onChange={e => setSelectedStyleId(e.target.value)} className="w-full p-3 border rounded-lg bg-bg-secondary-light dark:bg-bg-secondary-dark border-border-light dark:border-border-dark focus:ring-primary focus:border-primary">
                            {styles.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark mb-2">عنوان الحلقة</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="أدخل عنوان الحلقة..." className="w-full p-3 border rounded-lg bg-bg-secondary-light dark:bg-bg-secondary-dark border-border-light dark:border-border-dark focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark mb-2">مدة الحلقة (دقيقة)</label>
                        <input type="number" min="1" value={duration} onChange={e => setDuration(e.target.value)} placeholder="مثال: 22" className="w-full p-3 border rounded-lg bg-bg-secondary-light dark:bg-bg-secondary-dark border-border-light dark:border-border-dark focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark mb-2">لغة النص</label>
                        <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full p-3 border rounded-lg bg-bg-secondary-light dark:bg-bg-secondary-dark border-border-light dark:border-border-dark focus:ring-primary focus:border-primary">
                            <option value="العربية">العربية</option>
                            <option value="English">English</option>
                            <option value="Français">Français</option>
                        </select>
                    </div>
                </div>
                <div className="mt-6">
                    <label className="flex items-center justify-between text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark mb-2">
                        <span>النص المصدري (لتحويل المحتوى)</span>
                        {sourceText.trim() !== '' && (
                            <span className={`px-2 py-1 text-xs rounded-full text-white ${canUseClaudeForTransform ? 'bg-green-500' : 'bg-blue-500'}`}>
                                {`المحرك: ${canUseClaudeForTransform ? 'Claude (سريع)' : 'Gemini (دقيق)'}`}
                            </span>
                        )}
                    </label>
                    <textarea
                        value={sourceText}
                        onChange={(e) => setSourceText(e.target.value)}
                        placeholder="ضع هنا النص الخام (مثل مقال إخباري) ليتم تحويله إلى سيناريو. ترك هذا الحقل فارغاً سيمكنك من اختيار محرك التوليد أدناه."
                        className="w-full h-40 p-3 border rounded-lg bg-bg-secondary-light dark:bg-bg-secondary-dark border-border-light dark:border-border-dark focus:ring-primary focus:border-primary font-sans"
                    ></textarea>
                </div>
                 <div className="mt-6">
                    <label className="block text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark mb-2">
                        محرك التوليد (عندما يكون النص المصدري فارغاً)
                    </label>
                    <div className="relative" title={sourceText.trim() ? "هذا الخيار معطل عند توفير نص مصدري للتحويل" : getEngineTooltip(engine)}>
                        <select 
                            value={engine} 
                            onChange={e => setEngine(e.target.value as GenerationEngine)} 
                            disabled={sourceText.trim() !== ''}
                            className="w-full p-3 border rounded-lg bg-bg-secondary-light dark:bg-bg-secondary-dark border-border-light dark:border-border-dark focus:ring-primary focus:border-primary appearance-none disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                        >
                            <option value="gemini">Gemini API (افتراضي)</option>
                            <option value="claude" disabled={apiStatuses.claude !== 'connected'}>Claude API {apiStatuses.claude !== 'connected' && '(غير متصل)'}</option>
                            <option value="chatgpt" disabled={apiStatuses.chatGpt !== 'connected'}>ChatGPT API {apiStatuses.chatGpt !== 'connected' && '(غير متصل)'}</option>
                            <option value="hybrid" disabled={apiStatuses.claude !== 'connected' || apiStatuses.chatGpt !== 'connected'}>البحث الهجين { (apiStatuses.claude !== 'connected' || apiStatuses.chatGpt !== 'connected') && '(يتطلب كل المحركات)'}</option>
                            <option value="cross" disabled={apiStatuses.claude !== 'connected' || apiStatuses.chatGpt !== 'connected'}>البحث المتقاطع { (apiStatuses.claude !== 'connected' || apiStatuses.chatGpt !== 'connected') && '(يتطلب كل المحركات)'}</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-text-secondary-light dark:text-text-secondary-dark">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-4">
                    <ActionButton onClick={handleGenerateClick} text="توليد النص" icon="🚀" color="bg-gradient-to-r from-blue-500 to-indigo-600" isLoading={loadingStates.generate} />
                    <ActionButton onClick={handleGenerateIdeas} text="أفكار للحلقات" icon="💡" color="bg-gradient-to-r from-orange-400 to-red-500" isLoading={loadingStates.ideas} />
                    <ActionButton onClick={handleDeepResearch} text="بحث عميق" icon="🔬" color="bg-gradient-to-r from-teal-400 to-cyan-500" isLoading={loadingStates.research} />
                    <ActionButton onClick={handleFactCheck} text="تدقيق الحقائق" icon="✅" color="bg-gradient-to-r from-green-500 to-lime-600" isLoading={loadingStates.factCheck} disabled={!script} />
                </div>
            </div>

            {script && (
                <div className="space-y-8">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">النص المُولّد: {script.title}</h3>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center p-1 bg-bg-secondary-light dark:bg-bg-secondary-dark rounded-full border border-border-light dark:border-border-dark">
                                <button onClick={() => setIsPreview(false)} className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 ${!isPreview ? 'bg-primary text-white shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}>تعديل</button>
                                <button onClick={() => setIsPreview(true)} className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 ${isPreview ? 'bg-primary text-white shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}>عرض</button>
                            </div>
                            <button onClick={() => setIsAssetModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90 transition shadow-sm hover:shadow-lg transform hover:-translate-y-px">
                                <span>🖼️</span>
                                <span>الوسائط والصوت</span>
                            </button>
                        </div>
                      </div>
                      {isPreview ? (
                          <div
                              className="w-full h-96 p-4 border rounded-lg bg-bg-secondary-light dark:bg-bg-secondary-dark border-border-light dark:border-border-dark font-sans text-sm leading-relaxed overflow-y-auto"
                              dangerouslySetInnerHTML={{ __html: renderScriptContent(editedContent) }}
                          ></div>
                      ) : (
                          <textarea
                              value={editedContent}
                              onChange={(e) => setEditedContent(e.target.value)}
                              className="w-full h-96 p-4 border rounded-lg bg-bg-secondary-light dark:bg-bg-secondary-dark border-border-light dark:border-border-dark focus:ring-primary focus:border-primary font-sans text-sm leading-relaxed"
                              placeholder="يمكنك التعديل على النص هنا..."
                          ></textarea>
                      )}
                      <div className="mt-4 flex gap-3">
                        <button onClick={() => exportToWord(script, editedContent)} className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition">
                            <span>📝</span>
                            <span>تصدير Word</span>
                        </button>
                        <button onClick={handleAddToTrainingClick} className="flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50" disabled={!script || editedContent.trim() === script.content.trim()}>
                            <span>🧠</span>
                            <span>أضف للتدريب</span>
                        </button>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-4 text-text-primary-light dark:text-text-primary-dark">تقسيم المشاهد:</h3>
                      <div className="space-y-4">
                          {script.scenes.map((scene, index) => (
                              <div key={index} className="bg-bg-secondary-light dark:bg-bg-secondary-dark p-4 rounded-lg border-r-4 border-secondary">
                                  <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-bold">المشهد {index + 1}: {scene.description}</h4>
                                    <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">{scene.time}</span>
                                  </div>
                                  <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark"><strong>اقتراحات بصرية:</strong> {scene.visuals}</p>
                              </div>
                          ))}
                      </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-4 text-text-primary-light dark:text-text-primary-dark">المصادر:</h3>
                        <ol className="list-decimal list-inside space-y-2">
                            {script.sources.map((source, index) => (
                                <li key={index} id={`source-${index + 1}`} className="bg-bg-secondary-light dark:bg-bg-secondary-dark p-3 rounded-lg scroll-mt-4 text-sm">
                                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline break-words" title={`زيارة المصدر: ${source.url}`}>
                                        {source.name}
                                    </a>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            )}
             <Modal isOpen={isIdeasModalOpen} onClose={() => setIsIdeasModalOpen(false)} title={ideasModalContent.title}>
                <div className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap p-1">
                    {ideasModalContent.content}
                </div>
             </Modal>
             {script && (
                 <AssetGenerationModal
                    isOpen={isAssetModalOpen}
                    onClose={() => setIsAssetModalOpen(false)}
                    scriptText={editedContent}
                    addNotification={addNotification}
                />
             )}
        </div>
    );
};

export default NewScriptForm;